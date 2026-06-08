using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LogService.Infrastructure.Persistence.Entities;

[Table("action_records")]
public class ActionRecordEntity
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
    public DateTime Timestamp { get; set; }

    [ForeignKey(nameof(GameId))]
    public GameRecordEntity? Game { get; set; }
}
