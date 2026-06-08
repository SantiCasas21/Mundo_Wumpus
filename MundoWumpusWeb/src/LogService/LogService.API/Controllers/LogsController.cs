using LogService.Domain.Models;
using LogService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace LogService.API.Controllers;

[ApiController]
[Route("api/logs")]
public class LogsController : ControllerBase
{
    private readonly ILogRepository _repository;

    public LogsController(ILogRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// POST /api/logs/games — Guarda o actualiza el registro de una partida.
    /// </summary>
    [HttpPost("games")]
    public async Task<IActionResult> SaveGameLog([FromBody] GameLogDto dto)
    {
        var log = new GameLog
        {
            GameId = dto.GameId,
            Status = dto.Status,
            TotalTurns = dto.TotalTurns,
            TotalActions = dto.TotalActions,
            AgentHasGold = dto.AgentHasGold,
            AgentFinalRow = dto.AgentFinalRow,
            AgentFinalCol = dto.AgentFinalCol,
            StartedAt = dto.StartedAt,
            EndedAt = dto.EndedAt,
            Actions = dto.Actions?.Select(a => new ActionEntry
            {
                TurnNumber = a.TurnNumber,
                Action = a.Action,
                Description = a.Description,
                ResultingRow = a.ResultingRow,
                ResultingCol = a.ResultingCol,
                Timestamp = a.Timestamp
            }).ToList() ?? new()
        };

        await _repository.SaveGameRecordAsync(log);
        return Ok(new { success = true, gameId = log.GameId });
    }

    /// <summary>
    /// GET /api/logs/games — Lista todas las partidas registradas.
    /// </summary>
    [HttpGet("games")]
    public async Task<IActionResult> GetAllGames()
    {
        var logs = await _repository.GetAllGameLogsAsync();
        return Ok(logs.Select(MapToDto));
    }

    /// <summary>
    /// GET /api/logs/games/{id} — Obtiene el registro de una partida específica.
    /// </summary>
    [HttpGet("games/{id}")]
    public async Task<IActionResult> GetGameLog(Guid id)
    {
        var log = await _repository.GetGameLogAsync(id);
        if (log == null)
            return NotFound(new { error = "Partida no encontrada" });

        return Ok(MapToDto(log));
    }

    /// <summary>
    /// GET /api/logs/leaderboard — Top 10 de mejores puntajes.
    /// </summary>
    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int top = 10)
    {
        var leaderboard = await _repository.GetLeaderboardAsync(top);
        return Ok(leaderboard.Select(l => new LeaderboardEntryDto
        {
            GameId = l.GameId,
            Score = l.Score,
            TotalTurns = l.TotalTurns,
            DurationSeconds = l.DurationSeconds,
            EndedAt = l.EndedAt
        }));
    }

    private static GameLogDto MapToDto(GameLog log)
    {
        return new GameLogDto
        {
            GameId = log.GameId,
            Status = log.Status,
            TotalTurns = log.TotalTurns,
            TotalActions = log.TotalActions,
            AgentHasGold = log.AgentHasGold,
            AgentFinalRow = log.AgentFinalRow,
            AgentFinalCol = log.AgentFinalCol,
            StartedAt = log.StartedAt,
            EndedAt = log.EndedAt,
            Score = log.Score,
            DurationSeconds = log.DurationSeconds,
            Actions = log.Actions.Select(a => new ActionEntryDto
            {
                TurnNumber = a.TurnNumber,
                Action = a.Action,
                Description = a.Description,
                ResultingRow = a.ResultingRow,
                ResultingCol = a.ResultingCol,
                Timestamp = a.Timestamp
            }).ToList()
        };
    }
}

// DTOs
public class GameLogDto
{
    public Guid GameId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalTurns { get; set; }
    public int TotalActions { get; set; }
    public bool AgentHasGold { get; set; }
    public int AgentFinalRow { get; set; }
    public int AgentFinalCol { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int Score { get; set; }
    public double DurationSeconds { get; set; }
    public List<ActionEntryDto> Actions { get; set; } = new();
}

public class ActionEntryDto
{
    public int TurnNumber { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ResultingRow { get; set; }
    public int ResultingCol { get; set; }
    public DateTime Timestamp { get; set; }
}

public class LeaderboardEntryDto
{
    public Guid GameId { get; set; }
    public int Score { get; set; }
    public int TotalTurns { get; set; }
    public double DurationSeconds { get; set; }
    public DateTime? EndedAt { get; set; }
}
