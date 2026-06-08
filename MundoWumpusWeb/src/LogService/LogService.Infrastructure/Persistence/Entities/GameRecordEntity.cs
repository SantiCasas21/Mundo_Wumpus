using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LogService.Infrastructure.Persistence.Entities;

/// <summary>
/// Registro de partida para el servicio de logs/leaderboard.
/// </summary>
[Table("game_records")]
public class GameRecordEntity
{
    [Key]
    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;

    [Column("total_turns")]
    public int TotalTurns { get; set; }

    [Column("total_actions")]
    public int TotalActions { get; set; }

    [Column("has_gold")]
    public bool HasGold { get; set; }

    [Column("agent_final_row")]
    public int AgentFinalRow { get; set; }

    [Column("agent_final_col")]
    public int AgentFinalCol { get; set; }

    [Column("score")]
    public int Score { get; set; }

    [Column("started_at")]
    public DateTime StartedAt { get; set; }

    [Column("ended_at")]
    public DateTime? EndedAt { get; set; }

    public List<ActionRecordEntity> Actions { get; set; } = new();
}
