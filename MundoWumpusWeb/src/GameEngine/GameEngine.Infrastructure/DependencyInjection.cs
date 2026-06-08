using GameEngine.Infrastructure.Persistence;
using GameEngine.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GameEngine.Infrastructure;

/// <summary>
/// Extensión para registro de servicios de infraestructura en el contenedor DI.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddGameEngineInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Registrar DbContext con PostgreSQL
        services.AddDbContext<GameEngineDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("GameEngineDb"),
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(3)
            ));

        // Registrar repositorios
        services.AddScoped<IGameRepository, GameRepository>();

        return services;
    }
}
