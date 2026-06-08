using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameEngine.Infrastructure.Persistence.Entities;

/// <summary>
/// Entidad de persistencia para una partida guardada en base de datos.
/// </summary>
[Table("games")]
public class GameEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("status")]
    [MaxLength(20)]
    public string Status { get; set; } = "InProgress";

    [Column("agent_row")]
    public int AgentRow { get; set; }

    [Column("agent_col")]
    public int AgentCol { get; set; }

    [Column("has_gold")]
    public bool HasGold { get; set; }

    [Column("turn")]
    public int Turn { get; set; }

    /// <summary>Tablero serializado como JSON (array 2D de strings).</summary>
    [Column("board_data", TypeName = "jsonb")]
    public string BoardData { get; set; } = "[]";

    /// <summary>Percepciones serializadas como JSON.</summary>
    [Column("perceptions_data", TypeName = "jsonb")]
    public string PerceptionsData { get; set; } = "[]";

    [Column("started_at")]
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    [Column("ended_at")]
    public DateTime? EndedAt { get; set; }

    /// <summary>Acciones registradas para esta partida.</summary>
    public List<GameActionEntity> Actions { get; set; } = new();
}
