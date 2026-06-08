using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configurar puerto
var port = builder.Configuration.GetValue<int?>("Port") ?? 5000;
builder.WebHost.UseUrls($"http://*:{port}");

// Cargar configuración de Ocelot según entorno
// - Producción/Docker: ocelot.json (usa nombres de servicio Docker: game-engine-api, log-service-api)
// - Desarrollo local: ocelot.Development.json (usa localhost)
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("ocelot.Development.json", optional: true, reloadOnChange: true);
}
else
{
    builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
}

// Registrar servicios de Ocelot
builder.Services.AddOcelot(builder.Configuration);

// CORS para el frontend
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

app.UseCors("AllowFrontend");

// Health check
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "api-gateway",
    timestamp = DateTime.UtcNow
}));

// Usar Ocelot como middleware de enrutamiento
await app.UseOcelot();

await app.RunAsync();
