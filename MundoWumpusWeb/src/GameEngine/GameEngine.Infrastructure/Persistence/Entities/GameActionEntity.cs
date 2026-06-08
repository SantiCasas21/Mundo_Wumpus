using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameEngine.Infrastructure.Persistence.Entities;

/// <summary>
/// Entidad de persistencia para una acción individual dentro de una partida.
/// </summary>
[Table("game_actions")]
public class GameActionEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("turn_number")]
    public int TurnNumber { get; set; }

    [Column("action")]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    [Column("description")]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Column("resulting_row")]
    public int ResultingRow { get; set; }

    [Column("resulting_col")]
    public int ResultingCol { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>Navegación a la partida padre.</summary>
    [ForeignKey(nameof(GameId))]
    public GameEntity? Game { get; set; }
}
