# 🏰 Mundo de Wumpus

![.NET 9](https://img.shields.io/badge/.NET%209-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Angular 18](https://img.shields.io/badge/Angular%2018-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Ocelot](https://img.shields.io/badge/Ocelot-6A2F8A?style=for-the-badge&logo=.net&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Mundo de Wumpus** es la transformación full-stack del clásico juego de exploración e inteligencia artificial, migrado de una simulación de consola en C++ a una **arquitectura moderna de microservicios en .NET 9** con un **frontend reactivo en Angular 18**. El proyecto implementa un motor de juego que genera mapas aleatorios con entidades (Wumpus, pozos, oro), un sistema de percepciones (brisa, hedor, brillo) basado en propagación por adyacencia, y un dashboard interactivo que reemplaza la terminal por una interfaz visual con CSS Grid, gráficos SVG y estadísticas en tiempo real. Está diseñado para demostrar competencias en **Clean Architecture**, sistemas distribuidos con **API Gateway (Ocelot)** y **Entity Framework Core** sobre PostgreSQL.

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────┐
│            🌐 Angular 18 Frontend (:4200)          │
│     Dashboard con CSS Grid · SVG Charts · WASD     │
└────────────────────┬─────────────────────────────┘
                     │ HTTP (localhost:5000)
┌────────────────────▼─────────────────────────────┐
│           🔀 Ocelot API Gateway (:5000)            │
│     /api/game/* → GameEngine    /api/logs/* → Logs │
└─────────┬───────────────────────────┬────────────┘
          │                           │
┌─────────▼──────────┐   ┌───────────▼─────────────┐
│ 🎮 GameEngine API  │   │ 📊 Log Service API       │
│     (:5001)         │   │     (:5002)               │
│                    │   │                          │
│ Clean Architecture │   │ • Historial de partidas  │
│ • Domain (reglas)  │   │ • Leaderboard (top 10)   │
│ • Infrastructure   │   │ • Replay de acciones     │
│ • API (REST)       │   │                          │
└─────────┬──────────┘   └───────────┬─────────────┘
          │                           │
┌─────────▼───────────────────────────▼─────────────┐
│               🗄️ PostgreSQL 16 (:5432)             │
│    wumpus_gameengine    │    wumpus_logs            │
└────────────────────────────────────────────────────┘
```

---

## ✨ Características Principales

- **Motor de Juego con Percepciones:** Traducción fiel de la lógica C++ original. Tablero 10×10 con colocación aleatoria de 1 Wumpus, 1 Oro y 10 Pozos. Cálculo de brisa, hedor y brillo por propagación a las 4 celdas adyacentes (Norte, Sur, Este, Oeste).
- **Dashboard Interactivo:** Tablero renderizado con CSS Grid, celdas con indicadores visuales de percepciones, animación de pulso en la posición del agente y panel lateral con estadísticas en tiempo real.
- **Control Dual:** Captura de eventos de teclado (W/A/S/D/T) más D-Pad visual con botones clickeables y confirmación de rendición.
- **Gráficos SVG Personalizados:** Gauge circular de nivel de peligro, barras de progreso para porcentaje de celdas visitadas y badges de estado — sin dependencias externas de charting.
- **API Gateway con Ocelot:** Ruteo centralizado por prefijo de ruta. El frontend solo conoce una URL base.
- **Persistencia con EF Core 9:** PostgreSQL con JSONB para tablero y percepciones, tablas relacionales para acciones. Auto-migración al iniciar cada microservicio.
- **Leaderboard e Historial:** Top 10 partidas ganadas por puntaje. Historial completo navegable con detalle de acciones por turno.
- **Dockerizado:** Un solo comando levanta todo el sistema: PostgreSQL, 2 microservicios .NET, API Gateway y frontend Angular con Nginx.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| .NET SDK | **9.0** | `dotnet --version` |
| Node.js | **18+** | `node --version` |
| Angular CLI | **18.x** | `ng version` |
| Docker Desktop | **4.x** | `docker --version` |
| PostgreSQL | 16 (vía Docker) | — |

```bash
npm install -g @angular/cli@18
```

---

## ⚡ Ejecución con Docker (Recomendado)

```bash
cd MundoWumpusWeb
docker compose up --build
```

Esto compila las imágenes, crea las bases de datos `wumpus_gameengine` y `wumpus_logs`, ejecuta las migraciones automáticamente y levanta todos los servicios en orden.

### Acceso Rápido

| Servicio | URL |
|---|---|
| 🌐 **Dashboard** | http://localhost:4200 |
| 🏆 **Leaderboard** | http://localhost:4200/leaderboard |
| 📜 **Historial de Partidas** | http://localhost:4200/history |
| 🚪 **API Gateway** | http://localhost:5000 |
| 🎮 **Game Engine API** | http://localhost:5001 |
| 📊 **Log Service API** | http://localhost:5002 |
| 🗄️ **PostgreSQL** | localhost:5432 |

---

## 🚀 Ejecución Manual (Desarrollo Local)

Útil para debugging. Requiere PostgreSQL 16 corriendo (local o vía Docker).

### 1. Base de Datos

```bash
# Solo PostgreSQL en Docker (recomendado)
docker compose up -d postgres

# O PostgreSQL local
psql -U postgres -c "CREATE DATABASE wumpus_gameengine;"
psql -U postgres -c "CREATE DATABASE wumpus_logs;"
```

> Las tablas se crean automáticamente al iniciar cada microservicio mediante `EnsureCreatedAsync()`. No se requieren comandos de migración manuales.

### 2. Microservicios .NET (3 terminales)

```bash
# Terminal 1 — GameEngine Service
cd src/GameEngine/GameEngine.API && dotnet run    # → http://localhost:5001

# Terminal 2 — Log Service
cd src/LogService/LogService.API && dotnet run     # → http://localhost:5002

# Terminal 3 — API Gateway
cd src/ApiGateway && dotnet run                    # → http://localhost:5000
```

> En modo desarrollo, el Gateway carga `ocelot.Development.json` que apunta a `localhost` en vez de nombres de servicio Docker.

### 3. Frontend Angular

```bash
cd src/WumpusFrontend
npm install
ng serve                                           # → http://localhost:4200
```

### 4. Verificar

```bash
curl http://localhost:5001/health   # Game Engine
curl http://localhost:5002/health   # Log Service
curl http://localhost:5000/health   # API Gateway
curl -X POST http://localhost:5000/api/game/new   # Crear partida de prueba
```

---

## 🎮 Controles del Juego

| Tecla | Botón | Acción |
|---|---|---|
| **W** | ⬆️ | Mover al Norte (fila −1) |
| **A** | ⬅️ | Mover al Oeste (columna −1) |
| **S** | ⬇️ | Mover al Sur (fila +1) |
| **D** | ➡️ | Mover al Este (columna +1) |
| **T** | 💰 Recoger Oro | Tomar el oro si está en la celda actual |
| 🏳️ | Rendirse | Abandonar la partida (requiere confirmación) |

**Reglas del juego:** Encuentra el oro y regresa a la celda inicial (F9 C0) sin caer en un pozo ni ser devorado por el Wumpus. Usa las percepciones para navegar:

| Percepción | Significado |
|---|---|
| 💨 **Brisa** | Hay un pozo en alguna celda adyacente |
| 👃 **Hedor** | El Wumpus está en alguna celda adyacente |
| ✨ **Brillo** | El oro está en esta misma celda |

---

## 📡 API Endpoints

### GameEngine Service → Gateway: `/api/game/*`

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| `POST` | `/api/game/new` | Crear nueva partida | — |
| `POST` | `/api/game/{id}/move` | Mover agente | `{ "direction": "North" }` |
| `POST` | `/api/game/{id}/grab` | Recoger oro | — |
| `POST` | `/api/game/{id}/surrender` | Rendirse | — |
| `GET` | `/api/game/{id}` | Estado de la partida | — |
| `GET` | `/api/game/{id}/perceptions` | Tabla de percepciones | — |

**Direcciones válidas:** `North`, `South`, `West`, `East`

**Ejemplo de respuesta:**
```json
{
  "gameId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "InProgress",
  "agent": { "row": 9, "col": 0, "hasGold": false, "turn": 0 },
  "board": [["."], ["."], "..."],
  "perceptions": { "cells": [...] },
  "visitedPercentage": 1.0,
  "dangerLevel": 5,
  "totalTurns": 0,
  "totalActions": 1,
  "actions": [...]
}
```

### LogService → Gateway: `/api/logs/*`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/logs/games` | Guardar registro de partida |
| `GET` | `/api/logs/games` | Listar todas las partidas |
| `GET` | `/api/logs/games/{id}` | Detalle con acciones |
| `GET` | `/api/logs/leaderboard?top=10` | Top partidas ganadas |

---

## 🗂️ Estructura del Proyecto

```
MundoWumpusWeb/
├── MundoWumpus.sln
├── docker-compose.yml
├── README.md
│
├── db/
│   └── init-multiple-dbs.sh
│
├── src/
│   ├── GameEngine/                        ← Microservicio 1: Motor de Juego
│   │   ├── GameEngine.Domain/             ← Clean Architecture — Capa de Dominio
│   │   │   ├── Enums.cs                   ←   CellType, GameStatus, Direction
│   │   │   ├── GameConstants.cs           ←   Configuración del tablero (10×10)
│   │   │   ├── Models/                    ←   Agent, Board, Perceptions, GameState
│   │   │   └── Services/                  ←   BoardInitializer, PerceptionCalculator,
│   │   │                                  ←   GameEngineService (motor principal)
│   │   ├── GameEngine.Infrastructure/     ← Clean Architecture — Infraestructura
│   │   │   └── Persistence/               ←   EF Core DbContext, repositorio, mapper
│   │   └── GameEngine.API/                ← Clean Architecture — API REST
│   │       └── Controllers/               ←   GameController (6 endpoints)
│   │
│   ├── LogService/                        ← Microservicio 2: Logs y Leaderboard
│   │   ├── LogService.Domain/             ←   Modelo GameLog
│   │   ├── LogService.Infrastructure/     ←   EF Core DbContext + repositorio
│   │   └── LogService.API/                ←   LogsController (4 endpoints)
│   │
│   ├── ApiGateway/                        ← Ocelot API Gateway
│   │   ├── ocelot.json                    ←   Rutas para Docker (nombres de servicio)
│   │   └── ocelot.Development.json        ←   Rutas para desarrollo local (localhost)
│   │
│   └── WumpusFrontend/                    ← Angular 18 SPA
│       └── src/app/
│           ├── models/game-models.ts      ←   Interfaces TypeScript
│           ├── services/                  ←   game.service.ts, log.service.ts
│           └── components/                ←   8 componentes standalone
│               ├── game-board/            ←   Tablero 10×10 CSS Grid
│               ├── control-panel/         ←   D-Pad + botones de acción
│               ├── stats-panel/           ←   Estadísticas + gauge SVG
│               ├── perceptions-table/     ←   Tabla de percepciones
│               ├── actions-table/         ←   Tabla de acciones con badges
│               ├── game-over-modal/       ←   Modal de fin de partida
│               ├── leaderboard/           ←   Top 10 partidas ganadas
│               └── game-history/          ←   Historial completo
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Backend** | .NET 9 Web API · Clean Architecture |
| **API Gateway** | Ocelot 23.3 |
| **Frontend** | Angular 18 · Standalone Components · CSS Grid |
| **Base de Datos** | PostgreSQL 16 · JSONB para tablero y percepciones |
| **ORM** | Entity Framework Core 9 · Auto-migración con reintentos |
| **Contenedores** | Docker · Docker Compose · Healthchecks |
| **Gráficos** | SVG gauge + CSS progress bars (sin librerías externas) |
| **Web Server** | Nginx (Angular en producción) |

---

## 🏗️ Decisiones Arquitectónicas

| Decisión | Elección | Justificación |
|---|---|---|
| **Dos microservicios** | GameEngine + LogService | Separación de responsabilidades: estado del juego vs. consultas históricas. Cada uno con su propia base de datos |
| **Clean Architecture** | Domain / Infrastructure / API | La lógica de negocio está aislada en Domain sin dependencias externas. Facilita testing y mantenibilidad |
| **API Gateway** | Ocelot | El frontend solo conoce una URL. Ruteo por prefijo. Extensible a rate limiting y auth |
| **JSONB para tablero** | PostgreSQL JSONB | El tablero es un array 2D serializado. No requiere tabla de 100 celdas con joins |
| **Auto-migración** | `EnsureCreatedAsync` con reintentos | Ideal para desarrollo y portfolio. En producción se migraría a migraciones formales con control de versiones |
| **SVG Charts sin librerías** | SVG + CSS nativos | Evita dependencias pesadas (Chart.js, D3). Demuestra capacidad de construir visualizaciones desde cero |
| **CSS Grid para tablero** | `display: grid` 10×10 | Mapeo natural. Responsive sin cálculos manuales de posición |
| **Standalone Components** | Angular 18 sin NgModules | API moderna de Angular. Mejor tree-shaking y lazy loading nativo |
| **GameEngineService Singleton** | Sí | El motor no tiene estado. El estado vive en `GameState` que se pasa por parámetro en cada request |
| **`AsNoTracking` en lecturas** | Sí | Evita conflictos de tracking de EF Core al hacer update posteriormente |

---

## 🧠 Lógica de Dominio: Migración C++ → C#

| Concepto C++ original | Implementación en C# | Descripción |
|---|---|---|
| `colocarEntidades()` | `BoardInitializer.PlaceEntities()` | Coloca 1 Wumpus, 1 Oro, 10 Pozos aleatoriamente evitando la celda inicial (9,0) |
| `calcularPercepciones()` | `PerceptionCalculator.Calculate()` | Itera 10×10, propaga brisa/hedor a 4 vecinos (N/S/E/O) |
| `moverAgente(W/A/S/D)` | `GameEngineService.MoveAgent(Direction)` | Valida límites, actualiza posición, turno y celdas visitadas |
| `tomarOro()` | `GameEngineService.GrabGold()` | Recolecta el oro si el agente está sobre él, recalcula percepciones |
| `verificarEstado()` | `GameEngineService.CheckGameStatus()` | Evalúa muerte por pozo, muerte por Wumpus, o victoria (oro + regreso a F9 C0) |
| `hayBrisa[]` / `hayHedor[]` / `visitado[]` | `Perceptions` (arrays internos con índice lineal) | `idx(fila, col)` → `row * 10 + col` |

---

## 🎨 Paleta del Dashboard

| Color | Hex | Uso |
|---|---|---|
| Dorado | `#f0c040` | Oro, puntajes, botones principales |
| Naranja | `#ff6b35` | Botón nueva partida, gradientes |
| Azul | `#4a90d9` | Celda del agente, glow de posición |
| Verde | `#44cc44` | Peligro bajo, estado normal |
| Ámbar | `#ffa500` | Peligro medio, advertencias |
| Rojo | `#ff4444` | Muerte, peligro alto, errores |
| Fondo | `#1a1a2e` | Fondo principal, tarjetas |

---

## 👤 Autor

**Santiago Casas** — Desarrollador Backend .NET & Arquitecto de Microservicios

---

🤖 *Portfolio project. Full-stack transformation from C++ console simulation to modern distributed web architecture with Clean Architecture, microservices, API Gateway, and reactive SPA.*
