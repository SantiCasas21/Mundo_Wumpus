using System.Text.Json;
using GameEngine.Domain;
using GameEngine.Domain.Models;
using GameEngine.Infrastructure.Persistence.Entities;

namespace GameEngine.Infrastructure.Persistence;

/// <summary>
/// Mapea entre el modelo de dominio (GameState) y las entidades de persistencia.
/// </summary>
public static class GameStateMapper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public static GameEntity ToEntity(GameState state)
    {
        var perceptions = state.Perceptions.GetSnapshot();

        return new GameEntity
        {
            Id = state.GameId,
            Status = state.Status.ToString(),
            AgentRow = state.Agent.Row,
            AgentCol = state.Agent.Col,
            HasGold = state.Agent.HasGold,
            Turn = state.Agent.Turn,
            BoardData = JsonSerializer.Serialize(state.Board.ToJaggedArray(), JsonOptions),
            PerceptionsData = JsonSerializer.Serialize(perceptions, JsonOptions),
            StartedAt = state.StartedAt,
            EndedAt = state.EndedAt,
            Actions = state.Actions.Select(a => ToActionEntity(a, state.GameId)).ToList()
        };
    }

    public static GameActionEntity ToActionEntity(GameAction action, Guid gameId)
    {
        return new GameActionEntity
        {
            GameId = gameId,
            TurnNumber = action.TurnNumber,
            Action = action.Action,
            Description = action.Description,
            ResultingRow = action.ResultingRow,
            ResultingCol = action.ResultingCol,
            Timestamp = action.Timestamp
        };
    }

    /// <summary>
    /// Reconstruye el GameState de dominio desde la entidad de persistencia.
    /// </summary>
    public static GameState ToDomain(GameEntity entity)
    {
        var state = new GameState
        {
            GameId = entity.Id,
            StartedAt = entity.StartedAt,
            EndedAt = entity.EndedAt
        };

        // Restaurar agente
        state.Agent.Row = entity.AgentRow;
        state.Agent.Col = entity.AgentCol;
        state.Agent.HasGold = entity.HasGold;
        state.Agent.Turn = entity.Turn;

        // Restaurar tablero desde JSON
        if (!string.IsNullOrEmpty(entity.BoardData))
        {
            var boardData = JsonSerializer.Deserialize<string[][]>(entity.BoardData, JsonOptions);
            if (boardData != null)
            {
                for (int r = 0; r < GameConstants.Rows && r < boardData.Length; r++)
                {
                    for (int c = 0; c < GameConstants.Cols && c < boardData[r].Length; c++)
                    {
                        state.Board[r, c] = boardData[r][c] switch
                        {
                            "W" => CellType.Wumpus,
                            "O" => CellType.Gold,
                            "P" => CellType.Pit,
                            _ => CellType.Empty
                        };
                    }
                }
            }
        }

        // Restaurar percepciones desde JSON
        if (!string.IsNullOrEmpty(entity.PerceptionsData))
        {
            var perData = JsonSerializer.Deserialize<PerceptionSnapshot>(entity.PerceptionsData, JsonOptions);
            if (perData?.Cells != null)
            {
                foreach (var cell in perData.Cells)
                {
                    state.Perceptions.SetBreeze(cell.Row, cell.Col, cell.HasBreeze);
                    state.Perceptions.SetStench(cell.Row, cell.Col, cell.HasStench);
                    state.Perceptions.SetGlitter(cell.Row, cell.Col, cell.HasGlitter);
                    state.Perceptions.SetVisited(cell.Row, cell.Col, cell.IsVisited);
                }
            }
        }

        // Restaurar acciones
        state.Actions = entity.Actions.Select(a => new GameAction
        {
            TurnNumber = a.TurnNumber,
            Action = a.Action,
            Description = a.Description,
            ResultingRow = a.ResultingRow,
            ResultingCol = a.ResultingCol,
            Timestamp = a.Timestamp
        }).ToList();

        // Restaurar estado
        if (Enum.TryParse<GameStatus>(entity.Status, out var status))
            state.Status = status;

        return state;
    }
}
