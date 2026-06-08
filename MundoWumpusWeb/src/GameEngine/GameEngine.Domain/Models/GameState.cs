namespace GameEngine.Domain.Models;

/// <summary>
/// Agregado raíz: estado completo de una partida.
/// Contiene el tablero, agente, percepciones, acciones y estado.
/// </summary>
public class GameState
{
    public Guid GameId { get; set; } = Guid.NewGuid();
    public Board Board { get; set; } = new();
    public Agent Agent { get; set; } = new();
    public Perceptions Perceptions { get; set; } = new();
    public GameStatus Status { get; set; } = GameStatus.InProgress;
    public List<GameAction> Actions { get; set; } = new();
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public int TotalTurns => Agent.Turn;

    /// <summary>Agrega una acción al historial, respetando el límite máximo.</summary>
    public void AddAction(GameAction action)
    {
        if (Actions.Count < GameConstants.MaxActions)
            Actions.Add(action);
    }

    /// <summary>Indica si el juego ya terminó (por victoria, muerte o rendición).</summary>
    public bool IsFinished => Status != GameStatus.InProgress;
}
