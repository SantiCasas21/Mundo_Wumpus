using GameEngine.Infrastructure.Persistence.Entities;

namespace GameEngine.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio para operaciones de persistencia de partidas.
/// </summary>
public interface IGameRepository
{
    Task<GameEntity?> GetByIdAsync(Guid id);
    Task<GameEntity> CreateAsync(GameEntity game);
    Task UpdateAsync(GameEntity game);
    Task<GameActionEntity> AddActionAsync(GameActionEntity action);
    Task<List<GameActionEntity>> GetActionsAsync(Guid gameId);
    Task<List<GameEntity>> GetActiveGamesAsync();
    Task SaveChangesAsync();
}
