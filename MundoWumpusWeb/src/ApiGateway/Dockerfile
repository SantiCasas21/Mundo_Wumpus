# =============================================================
# API Gateway (Ocelot) — Dockerfile multi-stage
# =============================================================

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["ApiGateway.csproj", "./"]
RUN dotnet restore "ApiGateway.csproj"

COPY . .

RUN dotnet publish "ApiGateway.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5000

ENTRYPOINT ["dotnet", "ApiGateway.dll"]
