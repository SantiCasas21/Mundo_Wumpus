using GameEngine.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameEngine.Infrastructure.Persistence.Repositories;

/// <summary>
/// Implementación del repositorio de partidas usando EF Core.
///
/// Estrategia de persistencia:
/// - Lectura con AsNoTracking() para evitar conflictos de identidad
/// - En UpdateAsync: eliminar acciones existentes, adjuntar juego como Modified,
///   y cada acción nueva como Added (NO usar _context.Update() porque marca
///   todo el grafo como Modified, incluso las acciones nuevas que necesitan INSERT)
/// </summary>
public class GameRepository : IGameRepository
{
    private readonly GameEngineDbContext _context;

    public GameRepository(GameEngineDbContext context)
    {
        _context = context;
    }

    public async Task<GameEntity?> GetByIdAsync(Guid id)
    {
        return await _context.Games
            .AsNoTracking()
            .Include(g => g.Actions.OrderBy(a => a.TurnNumber))
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<GameEntity> CreateAsync(GameEntity game)
    {
        _context.Games.Add(game);
        await _context.SaveChangesAsync();
        return game;
    }

    public async Task UpdateAsync(GameEntity updatedEntity)
    {
        // 1. Eliminar TODAS las acciones existentes de esta partida
        var existingActions = await _context.GameActions
            .Where(a => a.GameId == updatedEntity.Id)
            .ToListAsync();
        _context.GameActions.RemoveRange(existingActions);

        // 2. Adjuntar el juego como Modified (solo la entidad principal)
        //    NO usar _context.Games.Update() porque recorre el grafo y
        //    marca las acciones hijas como Modified en vez de Added
        _context.Entry(updatedEntity).State = EntityState.Modified;

        // 3. Adjuntar cada acción nueva como Added (van a INSERT, no UPDATE)
        foreach (var action in updatedEntity.Actions)
        {
            _context.Entry(action).State = EntityState.Added;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<GameActionEntity> AddActionAsync(GameActionEntity action)
    {
        _context.GameActions.Add(action);
        await _context.SaveChangesAsync();
        return action;
    }

    public async Task<List<GameActionEntity>> GetActionsAsync(Guid gameId)
    {
        return await _context.GameActions
            .AsNoTracking()
            .Where(a => a.GameId == gameId)
            .OrderBy(a => a.TurnNumber)
            .ToListAsync();
    }

    public async Task<List<GameEntity>> GetActiveGamesAsync()
    {
        return await _context.Games
            .AsNoTracking()
            .Where(g => g.Status == "InProgress")
            .OrderByDescending(g => g.StartedAt)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
