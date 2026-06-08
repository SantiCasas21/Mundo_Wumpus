namespace GameEngine.Domain.Models;

/// <summary>
/// Registro de una acción realizada por el jugador.
/// </summary>
public class GameAction
{
    public int TurnNumber { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ResultingRow { get; set; }
    public int ResultingCol { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
