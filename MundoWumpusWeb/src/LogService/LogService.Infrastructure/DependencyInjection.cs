using LogService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LogService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLogServiceInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<LogServiceDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("LogServiceDb"),
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(3)
            ));

        services.AddScoped<ILogRepository, LogRepository>();

        return services;
    }
}
