using LogService.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace LogService.Infrastructure.Persistence;

public class LogServiceDbContext : DbContext
{
    public LogServiceDbContext(DbContextOptions<LogServiceDbContext> options)
        : base(options) { }

    public DbSet<GameRecordEntity> GameRecords => Set<GameRecordEntity>();
    public DbSet<ActionRecordEntity> ActionRecords => Set<ActionRecordEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GameRecordEntity>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Score);
            entity.HasIndex(e => e.StartedAt);

            entity.HasMany(e => e.Actions)
                  .WithOne(a => a.Game)
                  .HasForeignKey(a => a.GameId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ActionRecordEntity>(entity =>
        {
            entity.HasIndex(e => e.GameId);
        });
    }
}
