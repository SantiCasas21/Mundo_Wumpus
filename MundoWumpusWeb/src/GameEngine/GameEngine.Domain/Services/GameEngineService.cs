using GameEngine.Domain.Models;

namespace GameEngine.Domain.Services;

/// <summary>
/// Servicio principal del motor de juego. Orquesta todas las reglas del Mundo de Wumpus:
/// - Inicialización del tablero y entidades
/// - Movimiento del agente (W/A/S/D → Norte/Oeste/Sur/Este)
/// - Recoger oro (T)
/// - Verificación de estado (muerte por pozo/Wumpus, victoria)
/// - Rendición
/// Equivalente al bucleJuego() + mecánicas del código C++ original.
/// </summary>
public class GameEngineService
{
    private readonly BoardInitializer _boardInitializer;
    private readonly PerceptionCalculator _perceptionCalculator;

    public GameEngineService()
    {
        _boardInitializer = new BoardInitializer();
        _perceptionCalculator = new PerceptionCalculator();
    }

    public GameEngineService(int seed)
    {
        _boardInitializer = new BoardInitializer(seed);
        _perceptionCalculator = new PerceptionCalculator();
    }

    /// <summary>
    /// Crea e inicializa una nueva partida: tablero, entidades, percepciones.
    /// </summary>
    public GameState CreateNewGame()
    {
        var state = new GameState();

        _boardInitializer.PlaceEntities(state.Board);
        _perceptionCalculator.Calculate(state.Board, state.Perceptions);

        // Marcar celda inicial como visitada
        state.Perceptions.SetVisited(state.Agent.Row, state.Agent.Col, true);

        state.AddAction(new GameAction
        {
            TurnNumber = 0,
            Action = "START",
            Description = "Juego iniciado. Agente en F9 C0.",
            ResultingRow = state.Agent.Row,
            ResultingCol = state.Agent.Col,
            Timestamp = DateTime.UtcNow
        });

        return state;
    }

    /// <summary>
    /// Intenta mover al agente en la dirección indicada.
    /// Retorna true si el movimiento fue válido (dentro del tablero).
    /// </summary>
    public bool MoveAgent(GameState state, Direction direction)
    {
        if (state.IsFinished)
            return false;

        int newRow = state.Agent.Row;
        int newCol = state.Agent.Col;

        switch (direction)
        {
            case Direction.North: newRow--; break;
            case Direction.South: newRow++; break;
            case Direction.West:  newCol--; break;
            case Direction.East:  newCol++; break;
        }

        if (!PerceptionCalculator.IsWithinBounds(newRow, newCol))
        {
            state.AddAction(new GameAction
            {
                TurnNumber = state.Agent.Turn,
                Action = "MOVE_INVALID",
                Description = "Movimiento inválido: fuera del tablero",
                ResultingRow = state.Agent.Row,
                ResultingCol = state.Agent.Col,
                Timestamp = DateTime.UtcNow
            });
            return false;
        }

        state.Agent.Row = newRow;
        state.Agent.Col = newCol;
        state.Agent.Turn++;
        state.Perceptions.SetVisited(newRow, newCol, true);

        string dirName = direction switch
        {
            Direction.North => "Norte",
            Direction.South => "Sur",
            Direction.West => "Oeste",
            Direction.East => "Este",
            _ => "?"
        };

        state.AddAction(new GameAction
        {
            TurnNumber = state.Agent.Turn,
            Action = "MOVE",
            Description = $"Turno {state.Agent.Turn}: Mover {dirName} -> F{newRow} C{newCol}",
            ResultingRow = newRow,
            ResultingCol = newCol,
            Timestamp = DateTime.UtcNow
        });

        return true;
    }

    /// <summary>
    /// Intenta recoger el oro si el agente está sobre su celda.
    /// </summary>
    public GrabResult GrabGold(GameState state)
    {
        if (state.IsFinished)
            return GrabResult.GameAlreadyEnded;

        int row = state.Agent.Row;
        int col = state.Agent.Col;

        if (state.Board[row, col] == CellType.Gold && !state.Agent.HasGold)
        {
            state.Agent.HasGold = true;
            state.Board[row, col] = CellType.Empty;
            state.Perceptions.SetGlitter(row, col, false);
            state.Agent.Turn++;

            // Recalcular percepciones (el brillo desaparece)
            _perceptionCalculator.Calculate(state.Board, state.Perceptions);

            state.AddAction(new GameAction
            {
                TurnNumber = state.Agent.Turn,
                Action = "GRAB",
                Description = $"Turno {state.Agent.Turn}: *** ORO TOMADO en F{row} C{col} ***",
                ResultingRow = row,
                ResultingCol = col,
                Timestamp = DateTime.UtcNow
            });

            return GrabResult.Success;
        }

        if (state.Agent.HasGold)
        {
            state.AddAction(new GameAction
            {
                TurnNumber = state.Agent.Turn,
                Action = "GRAB_IGNORED",
                Description = "Acción ignorada: ya tienes el oro",
                ResultingRow = row,
                ResultingCol = col,
                Timestamp = DateTime.UtcNow
            });
            return GrabResult.AlreadyHasGold;
        }

        state.AddAction(new GameAction
        {
            TurnNumber = state.Agent.Turn,
            Action = "GRAB_IGNORED",
            Description = "Acción ignorada: no hay oro aquí",
            ResultingRow = row,
            ResultingCol = col,
            Timestamp = DateTime.UtcNow
        });
        return GrabResult.NoGoldHere;
    }

    /// <summary>
    /// Verifica el estado actual de la partida tras un movimiento o acción.
    /// </summary>
    public GameStatus CheckGameStatus(GameState state)
    {
        int row = state.Agent.Row;
        int col = state.Agent.Col;
        CellType cell = state.Board[row, col];

        if (cell == CellType.Pit)
            return GameStatus.DiedPit;

        if (cell == CellType.Wumpus)
            return GameStatus.DiedWumpus;

        // Victoria: agente tiene el oro y regresó a la celda inicial (F9 C0)
        if (state.Agent.HasGold && state.Agent.IsAtStart())
            return GameStatus.Won;

        return GameStatus.InProgress;
    }

    /// <summary>
    /// Aplica la verificación de estado al juego actual y actualiza Status si terminó.
    /// </summary>
    public void UpdateGameStatus(GameState state)
    {
        state.Status = CheckGameStatus(state);
        if (state.IsFinished)
            state.EndedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// El jugador se rinde voluntariamente.
    /// </summary>
    public void Surrender(GameState state)
    {
        state.AddAction(new GameAction
        {
            TurnNumber = state.Agent.Turn,
            Action = "SURRENDER",
            Description = $"Turno {state.Agent.Turn}: El jugador se rindió.",
            ResultingRow = state.Agent.Row,
            ResultingCol = state.Agent.Col,
            Timestamp = DateTime.UtcNow
        });
        state.Status = GameStatus.Surrendered;
        state.EndedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Calcula el porcentaje de celdas visitadas por el agente.
    /// </summary>
    public double CalculateVisitedPercentage(GameState state)
    {
        int visited = 0;
        for (int r = 0; r < GameConstants.Rows; r++)
            for (int c = 0; c < GameConstants.Cols; c++)
                if (state.Perceptions.IsVisited(r, c))
                    visited++;
        return (double)visited / GameConstants.TotalCells * 100.0;
    }

    /// <summary>
    /// Calcula un índice de peligro estimado (0-100) basado en las percepciones
    /// de la celda actual y celdas adyacentes visitadas.
    /// </summary>
    public int CalculateDangerLevel(GameState state)
    {
        int danger = 0;
        int row = state.Agent.Row;
        int col = state.Agent.Col;

        // Percepciones en la celda actual
        if (state.Perceptions.HasBreeze(row, col)) danger += 35;
        if (state.Perceptions.HasStench(row, col)) danger += 50;

        // Si tiene brisa y hedor juntos, peligro máximo
        if (state.Perceptions.HasBreeze(row, col) && state.Perceptions.HasStench(row, col))
            danger = 90;

        // Si no hay percepciones, la celda es segura
        if (!state.Perceptions.HasBreeze(row, col) && !state.Perceptions.HasStench(row, col))
            danger = 5;

        return Math.Min(danger, 100);
    }
}

/// <summary>
/// Resultado de intentar recoger el oro.
/// </summary>
public enum GrabResult
{
    Success,
    AlreadyHasGold,
    NoGoldHere,
    GameAlreadyEnded
}
