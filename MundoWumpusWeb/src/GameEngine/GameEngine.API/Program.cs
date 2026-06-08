using GameEngine.Domain.Services;
using GameEngine.Infrastructure;
using GameEngine.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar puerto para el microservicio
var port = builder.Configuration.GetValue<int?>("Port") ?? 5001;
builder.WebHost.UseUrls($"http://*:{port}");

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Registrar servicios de dominio
builder.Services.AddSingleton<GameEngineService>();

// Registrar infraestructura (EF Core + PostgreSQL)
builder.Services.AddGameEngineInfrastructure(builder.Configuration);

// CORS para desarrollo (Angular se conecta desde otro puerto)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// =============================================================
// Auto-migración con reintentos
// PostgreSQL puede tardar unos segundos en aceptar conexiones
// incluso después de que el healthcheck pase
// =============================================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameEngineDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    const int maxRetries = 10;
    const int delaySeconds = 3;

    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            logger.LogInformation("Conectando a PostgreSQL (GameEngine) — intento {Attempt}/{MaxRetries}...",
                attempt, maxRetries);
            await db.Database.EnsureCreatedAsync();
            logger.LogInformation("Base de datos GameEngine lista.");
            break;
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            logger.LogWarning("Error conectando a PostgreSQL: {Error}. Reintentando en {Delay}s...",
                ex.InnerException?.Message ?? ex.Message, delaySeconds);
            await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.MapControllers();

// Health check para Docker
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "game-engine" }));

await app.RunAsync();
