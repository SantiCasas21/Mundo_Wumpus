# =============================================================
# Log Service Microservice — Dockerfile multi-stage
# =============================================================

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["LogService.Domain/LogService.Domain.csproj", "LogService.Domain/"]
COPY ["LogService.Infrastructure/LogService.Infrastructure.csproj", "LogService.Infrastructure/"]
COPY ["LogService.API/LogService.API.csproj", "LogService.API/"]

RUN dotnet restore "LogService.API/LogService.API.csproj"

COPY . .

WORKDIR /src/LogService.API
RUN dotnet publish "LogService.API.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5002

ENTRYPOINT ["dotnet", "LogService.API.dll"]
