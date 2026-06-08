using LogService.Domain.Models;
using LogService.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace LogService.Infrastructure.Persistence;

public interface ILogRepository
{
    Task SaveGameRecordAsync(GameLog log);
    Task<GameLog?> GetGameLogAsync(Guid gameId);
    Task<List<GameLog>> GetAllGameLogsAsync();
    Task<List<GameLog>> GetLeaderboardAsync(int top = 10);
}

public class LogRepository : ILogRepository
{
    private readonly LogServiceDbContext _context;

    public LogRepository(LogServiceDbContext context)
    {
        _context = context;
    }

    public async Task SaveGameRecordAsync(GameLog log)
    {
        // Verificar si ya existe
        var existing = await _context.GameRecords
            .Include(g => g.Actions)
            .FirstOrDefaultAsync(g => g.GameId == log.GameId);

        if (existing != null)
        {
            // Actualizar registro existente
            existing.Status = log.Status;
            existing.TotalTurns = log.TotalTurns;
            existing.TotalActions = log.TotalActions;
            existing.HasGold = log.AgentHasGold;
            existing.AgentFinalRow = log.AgentFinalRow;
            existing.AgentFinalCol = log.AgentFinalCol;
            existing.Score = log.Score;
            existing.EndedAt = log.EndedAt;

            // Actualizar acciones
            _context.ActionRecords.RemoveRange(existing.Actions);
            existing.Actions = log.Actions.Select(a => new ActionRecordEntity
            {
                GameId = log.GameId,
                TurnNumber = a.TurnNumber,
                Action = a.Action,
                Description = a.Description,
                ResultingRow = a.ResultingRow,
                ResultingCol = a.ResultingCol,
                Timestamp = a.Timestamp
            }).ToList();
        }
        else
        {
            var entity = ToEntity(log);
            _context.GameRecords.Add(entity);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<GameLog?> GetGameLogAsync(Guid gameId)
    {
        var entity = await _context.GameRecords
            .Include(g => g.Actions.OrderBy(a => a.TurnNumber))
            .FirstOrDefaultAsync(g => g.GameId == gameId);

        return entity == null ? null : ToDomain(entity);
    }

    public async Task<List<GameLog>> GetAllGameLogsAsync()
    {
        var entities = await _context.GameRecords
            .Include(g => g.Actions.OrderBy(a => a.TurnNumber))
            .OrderByDescending(g => g.StartedAt)
            .ToListAsync();

        return entities.Select(ToDomain).ToList();
    }

    public async Task<List<GameLog>> GetLeaderboardAsync(int top = 10)
    {
        var entities = await _context.GameRecords
            .Where(g => g.Status == "Won")
            .OrderByDescending(g => g.Score)
            .ThenBy(g => g.TotalTurns)
            .Take(top)
            .ToListAsync();

        return entities.Select(ToDomain).ToList();
    }

    private static GameRecordEntity ToEntity(GameLog log)
    {
        return new GameRecordEntity
        {
            GameId = log.GameId,
            Status = log.Status,
            TotalTurns = log.TotalTurns,
            TotalActions = log.TotalActions,
            HasGold = log.AgentHasGold,
            AgentFinalRow = log.AgentFinalRow,
            AgentFinalCol = log.AgentFinalCol,
            Score = log.Score,
            StartedAt = log.StartedAt,
            EndedAt = log.EndedAt,
            Actions = log.Actions.Select(a => new ActionRecordEntity
            {
                GameId = log.GameId,
                TurnNumber = a.TurnNumber,
                Action = a.Action,
                Description = a.Description,
                ResultingRow = a.ResultingRow,
                ResultingCol = a.ResultingCol,
                Timestamp = a.Timestamp
            }).ToList()
        };
    }

    private static GameLog ToDomain(GameRecordEntity entity)
    {
        return new GameLog
        {
            GameId = entity.GameId,
            Status = entity.Status,
            TotalTurns = entity.TotalTurns,
            TotalActions = entity.TotalActions,
            AgentHasGold = entity.HasGold,
            AgentFinalRow = entity.AgentFinalRow,
            AgentFinalCol = entity.AgentFinalCol,
            StartedAt = entity.StartedAt,
            EndedAt = entity.EndedAt,
            Actions = entity.Actions.Select(a => new ActionEntry
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
