namespace LogService.Domain.Models;

/// <summary>
/// Modelo de dominio para el registro histórico de una partida.
/// </summary>
public class GameLog
{
    public Guid GameId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalTurns { get; set; }
    public int TotalActions { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public bool AgentHasGold { get; set; }
    public int AgentFinalRow { get; set; }
    public int AgentFinalCol { get; set; }
    public List<ActionEntry> Actions { get; set; } = new();

    /// <summary>Duración de la partida en segundos.</summary>
    public double DurationSeconds =>
        EndedAt.HasValue ? (EndedAt.Value - StartedAt).TotalSeconds : 0;

    /// <summary>Puntaje: menos turnos es mejor. Solo para partidas ganadas.</summary>
    public int Score => Status == "Won" ? Math.Max(0, 1000 - TotalTurns * 10) : 0;
}

public class ActionEntry
{
    public int TurnNumber { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ResultingRow { get; set; }
    public int ResultingCol { get; set; }
    public DateTime Timestamp { get; set; }
}
