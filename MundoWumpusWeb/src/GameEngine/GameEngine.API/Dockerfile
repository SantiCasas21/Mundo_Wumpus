# =============================================================
# Game Engine Microservice — Dockerfile multi-stage
# =============================================================

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["GameEngine.Domain/GameEngine.Domain.csproj", "GameEngine.Domain/"]
COPY ["GameEngine.Infrastructure/GameEngine.Infrastructure.csproj", "GameEngine.Infrastructure/"]
COPY ["GameEngine.API/GameEngine.API.csproj", "GameEngine.API/"]

RUN dotnet restore "GameEngine.API/GameEngine.API.csproj"

# Copiar todo el código fuente
COPY . .

# Publicar la aplicación
WORKDIR /src/GameEngine.API
RUN dotnet publish "GameEngine.API.csproj" -c Release -o /app/publish --no-restore

# Imagen final
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5001

ENTRYPOINT ["dotnet", "GameEngine.API.dll"]
