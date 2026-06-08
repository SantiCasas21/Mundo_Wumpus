using GameEngine.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace GameEngine.Infrastructure.Persistence;

/// <summary>
/// Contexto de base de datos del Game Engine.
/// Almacena el estado de las partidas activas y su historial de acciones.
/// </summary>
public class GameEngineDbContext : DbContext
{
    public GameEngineDbContext(DbContextOptions<GameEngineDbContext> options)
        : base(options) { }

    public DbSet<GameEntity> Games => Set<GameEntity>();
    public DbSet<GameActionEntity> GameActions => Set<GameActionEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GameEntity>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartedAt);

            entity.HasMany(e => e.Actions)
                  .WithOne(a => a.Game)
                  .HasForeignKey(a => a.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GameActionEntity>(entity =>
        {
            entity.HasIndex(e => e.GameId);
            entity.HasIndex(e => e.TurnNumber);
        });
    }
}
