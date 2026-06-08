# 🏰 Mundo de Wumpus

![.NET 9](https://img.shields.io/badge/.NET%209-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Angular 18](https://img.shields.io/badge/Angular%2018-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Ocelot](https://img.shields.io/badge/Ocelot-6A2F8A?style=for-the-badge&logo=.net&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS Grid](https://img.shields.io/badge/CSS%20Grid-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Mundo de Wumpus** es la transformación **full-stack** del clásico juego de exploración e inteligencia artificial, migrado de una simulación de consola en C++ a una **arquitectura moderna de microservicios en .NET 9** con un **frontend reactivo en Angular 18**. El proyecto implementa un motor de juego que genera mapas aleatorios con entidades (Wumpus, pozos, oro), un sistema de percepciones (brisa, hedor, brillo) basado en propagación por adyacencia, y un **dashboard interactivo** que reemplaza la terminal por una interfaz visual con CSS Grid, gráficos SVG y estadísticas en tiempo real. Está diseñado para demostrar competencias en **Clean Architecture**, sistemas distribuidos con **API Gateway (Ocelot)**, **Entity Framework Core** sobre PostgreSQL y desarrollo de SPAs con componentes standalone.

---

## ✨ Características Principales

- **Motor de Juego Determinista:** Traducción fiel de la lógica C++ a servicios de dominio en C#. Inicialización aleatoria de tablero 10×10 (1 Wumpus, 1 Oro, 10 Pozos) con semilla configurable para partidas reproducibles.
- **Sistema de Percepciones por Adyacencia:** Cálculo completo de brisa (pozo adyacente), hedor (Wumpus adyacente) y brillo (oro en celda) mediante propagación a las 4 celdas vecinas (Norte, Sur, Este, Oeste), idéntico al algoritmo original.
- **Dashboard Interactivo:** Tablero 10×10 renderizado con CSS Grid, celdas con indicadores visuales de percepciones, animación de pulso en la posición del agente, y panel lateral con estadísticas en tiempo real.
- **Gráficos SVG Personalizados:** Gauge circular de nivel de peligro, barras de progreso para % de celdas visitadas, y badges de estado codificados por colores — sin dependencias externas de charting.
- **Control Dual Teclado/Botones:** Captura de eventos `keydown` para teclas W/A/S/D/T más D-Pad visual con botones clickeables y confirmación de rendición.
- **API Gateway Unificado:** Ocelot centraliza el acceso a los microservicios con ruteo por prefijo de ruta (`/api/game/*` → GameEngine, `/api/logs/*` → LogService).
- **Persistencia Relacional:** Entity Framework Core 9 con PostgreSQL. Cada partida guarda su tablero (JSON), percepciones, acciones y estado para consulta histórica y replay.
- **Leaderboard y Repetición:** Top 10 partidas ganadas ordenadas por puntaje. Historial completo con detalle de acciones por turno.
- **Auto-Migración:** Las bases de datos y tablas se crean automáticamente al iniciar cada microservicio (`EnsureCreated`), sin necesidad de ejecutar comandos de migración manuales.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| .NET SDK | **9.0** | `dotnet --version` |
| Node.js | **18+** | `node --version` |
| Angular CLI | **18.x** | `ng version` |
| Docker Desktop | **4.x** | `docker --version` |
| PostgreSQL | 16 (vía Docker) | — |

### Instalar Angular CLI (si aún no está)
```bash
npm install -g @angular/cli@18
```

---

## ⚡ Ejecución con Docker (Recomendado)

Levanta todos los servicios con un solo comando. Las bases de datos, tablas y migraciones se crean automáticamente.

```bash
# Desde el directorio MundoWumpusWeb
docker compose up --build
```

El comando `up --build` compila las imágenes de cada microservicio y del frontend, levanta PostgreSQL con las bases de datos `wumpus_gameengine` y `wumpus_logs`, y arranca todos los contenedores en orden de dependencia (postgres → microservicios → gateway → frontend).

### Acceso Rápido

| Servicio | URL |
|---|---|
| 🌐 **Dashboard** | http://localhost:4200 |
| 🏆 **Leaderboard** | http://localhost:4200/leaderboard |
| 📜 **Historial** | http://localhost:4200/history |
| 🚪 **API Gateway** | http://localhost:5000 |
| 🎮 **Game Engine API** | http://localhost:5001 |
| 📊 **Log Service API** | http://localhost:5002 |
| 🗄️ **PostgreSQL** | localhost:5432 |

---

## 🚀 Ejecución Manual (Desarrollo Local)

Útil para debugging y desarrollo iterativo. Requiere PostgreSQL 16 corriendo (local o vía Docker).

### 1. Base de Datos

```bash
# Opción A: Solo PostgreSQL en Docker
docker compose up -d postgres

# Opción B: PostgreSQL local — crear las bases de datos manualmente
psql -U postgres -c "CREATE DATABASE wumpus_gameengine;"
psql -U postgres -c "CREATE DATABASE wumpus_logs;"
```

> **Nota:** Las tablas se crean automáticamente al iniciar cada microservicio mediante `EnsureCreated()`. No es necesario ejecutar `dotnet ef migrations` ni `dotnet ef database update`.

### 2. Backend — Microservicios .NET

Ejecute cada servicio en una terminal separada. El orden importa: GameEngine y LogService primero, luego el Gateway.

```bash
# Terminal 1 — GameEngine Service (Puerto 5001)
cd src/GameEngine/GameEngine.API
dotnet run

# Terminal 2 — Log Service (Puerto 5002)
cd src/LogService/LogService.API
dotnet run

# Terminal 3 — API Gateway (Puerto 5000)
cd src/ApiGateway
dotnet run
```

> **Nota sobre migraciones:** Al iniciar, cada servicio ejecuta `db.Database.EnsureCreatedAsync()` que crea la base de datos y todas las tablas definidas en los DbContext si no existen. Si se modifica el modelo de datos, se deben eliminar las tablas manualmente o usar migraciones formales con `dotnet ef migrations add`.

### 3. Frontend — Angular SPA

```bash
cd src/WumpusFrontend
npm install
ng serve
# Alternativa: npm start
```

El frontend se sirve en http://localhost:4200 y se conecta al API Gateway en http://localhost:5000.

### 4. Verificar que todo funciona

```bash
# Health checks
curl http://localhost:5001/health   # Game Engine
curl http://localhost:5002/health   # Log Service
curl http://localhost:5000/health   # API Gateway

# Crear una partida de prueba
curl -X POST http://localhost:5000/api/game/new
```

---

## 🎮 Controles del Juego

| Tecla | Botón | Acción |
|---|---|---|
| **W** | ⬆️ | Mover al Norte (fila -1) |
| **A** | ⬅️ | Mover al Oeste (columna -1) |
| **S** | ⬇️ | Mover al Sur (fila +1) |
| **D** | ➡️ | Mover al Este (columna +1) |
| **T** | 💰 Recoger Oro | Tomar el oro si está en la celda actual |
| **Q** | 🏳️ Rendirse | Abandonar la partida (requiere confirmación) |

---

## 🗂️ Estructura del Proyecto

```
MundoWumpusWeb/
├── MundoWumpus.sln                        ← Solución .NET 9
├── docker-compose.yml                     ← Orquestación completa
├── docker-compose.override.yml            ← Overrides para desarrollo local
├── .dockerignore
├── README.md
│
├── db/
│   └── init-multiple-dbs.sh               ← Script de init multi-DB para PostgreSQL
│
├── src/
│   ├── GameEngine/                        ← Microservicio 1: Motor de Juego
│   │   ├── GameEngine.Domain/             ← Capa de Dominio (Clean Architecture)
│   │   │   ├── Enums.cs                   ← CellType, GameStatus, Direction
│   │   │   ├── GameConstants.cs           ← Dimensiones, cantidades, celda inicial
│   │   │   ├── Models/
│   │   │   │   ├── Agent.cs               ← Posición, oro, turno
│   │   │   │   ├── Board.cs               ← Tablero interno + serialización
│   │   │   │   ├── Perceptions.cs         ← Brisa, Hedor, Brillo, Visitado
│   │   │   │   ├── GameState.cs           ← Agregado raíz: estado completo
│   │   │   │   └── GameAction.cs          ← Registro de acción individual
│   │   │   └── Services/
│   │   │       ├── BoardInitializer.cs    ← Colocación aleatoria de entidades
│   │   │       ├── PerceptionCalculator.cs ← Cálculo de percepciones (adyacencia)
│   │   │       └── GameEngineService.cs   ← Motor principal: mover, tomar, estado
│   │   │
│   │   ├── GameEngine.Infrastructure/     ← Capa de Infraestructura
│   │   │   ├── DependencyInjection.cs     ← Extensión IServiceCollection
│   │   │   └── Persistence/
│   │   │       ├── GameEngineDbContext.cs ← EF Core DbContext
│   │   │       ├── GameStateMapper.cs     ← Domain ↔ Entity mapping
│   │   │       ├── Entities/
│   │   │       │   ├── GameEntity.cs      ← Tabla games (JSONB para board)
│   │   │       │   └── GameActionEntity.cs ← Tabla game_actions
│   │   │       └── Repositories/
│   │   │           ├── IGameRepository.cs ← Interfaz del repositorio
│   │   │           └── GameRepository.cs  ← Implementación EF Core
│   │   │
│   │   └── GameEngine.API/                ← Capa de Presentación
│   │       ├── Program.cs                 ← Startup + EnsureCreated + CORS
│   │       ├── Dockerfile
│   │       └── Controllers/
│   │           └── GameController.cs      ← Endpoints REST + DTOs
│   │
│   ├── LogService/                        ← Microservicio 2: Logs y Leaderboard
│   │   ├── LogService.Domain/
│   │   │   └── Models/
│   │   │       └── GameLog.cs             ← Modelo de registro histórico
│   │   │
│   │   ├── LogService.Infrastructure/
│   │   │   ├── DependencyInjection.cs
│   │   │   └── Persistence/
│   │   │       ├── LogServiceDbContext.cs
│   │   │       ├── LogRepository.cs       ← Interfaz + implementación
│   │   │       └── Entities/
│   │   │           ├── GameRecordEntity.cs
│   │   │           └── ActionRecordEntity.cs
│   │   │
│   │   └── LogService.API/
│   │       ├── Program.cs                 ← Startup + EnsureCreated + CORS
│   │       ├── Dockerfile
│   │       └── Controllers/
│   │           └── LogsController.cs      ← Endpoints REST + DTOs
│   │
│   ├── ApiGateway/                        ← Ocelot API Gateway
│   │   ├── Program.cs                     ← Ocelot middleware + CORS
│   │   ├── ocelot.json                    ← Rutas upstream/downstream
│   │   └── Dockerfile
│   │
│   └── WumpusFrontend/                    ← Angular 18 SPA
│       ├── Dockerfile                     ← Multi-stage: node → nginx
│       └── src/app/
│           ├── app.component.ts           ← Componente raíz: orquestación
│           ├── app.config.ts              ← Standalone + HttpClient
│           ├── app.routes.ts              ← Rutas: /, /leaderboard, /history
│           ├── models/
│           │   └── game-models.ts         ← Interfaces TypeScript
│           ├── services/
│           │   ├── game.service.ts        ← Cliente HTTP GameEngine
│           │   └── log.service.ts         ← Cliente HTTP LogService
│           └── components/
│               ├── game-board/            ← Tablero 10×10 CSS Grid
│               ├── control-panel/         ← D-Pad + botones de acción
│               ├── stats-panel/           ← Estadísticas + gauge SVG
│               ├── perceptions-table/     ← Tabla de percepciones
│               ├── actions-table/         ← Tabla de acciones con badges
│               ├── game-over-modal/       ← Modal de fin de partida
│               ├── leaderboard/           ← Top 10 partidas ganadas
│               └── game-history/          ← Historial completo
```

---

## 📡 API Endpoints

### GameEngine Service — vía Gateway: `/api/game/*`

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| `POST` | `/api/game/new` | Crear nueva partida con tablero aleatorio | — |
| `POST` | `/api/game/{id}/move` | Mover agente en una dirección | `{ "direction": "North" }` |
| `POST` | `/api/game/{id}/grab` | Recoger oro de la celda actual | — |
| `POST` | `/api/game/{id}/surrender` | Rendirse voluntariamente | — |
| `GET` | `/api/game/{id}` | Obtener estado completo de la partida | — |
| `GET` | `/api/game/{id}/perceptions` | Tabla de percepciones (celdas relevantes) | — |

**Formato de dirección:** `North`, `South`, `West`, `East`

**Respuesta `POST /api/game/new` y `GET /api/game/{id}`:**
```json
{
  "gameId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "InProgress",
  "agent": { "row": 9, "col": 0, "hasGold": false, "turn": 0 },
  "board": [["."], ["."], ...],
  "perceptions": { "cells": [...] },
  "visitedPercentage": 1.0,
  "dangerLevel": 5,
  "totalTurns": 0,
  "totalActions": 1,
  "actions": [...]
}
```

### LogService — vía Gateway: `/api/logs/*`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/logs/games` | Guardar o actualizar registro de partida |
| `GET` | `/api/logs/games` | Listar todas las partidas registradas |
| `GET` | `/api/logs/games/{id}` | Obtener detalle de una partida con sus acciones |
| `GET` | `/api/logs/leaderboard?top=10` | Top partidas ganadas por puntaje |

---

## 🎨 Paleta del Dashboard

| Color | Hex | Uso |
|---|---|---|
| Dorado Wumpus | `#f0c040` | Oro, puntajes, botones principales, títulos |
| Naranja fuego | `#ff6b35` | Botón nueva partida, gradientes de acción |
| Azul agente | `#4a90d9` | Celda del agente, glow de posición actual |
| Verde seguro | `#44cc44` | Nivel de peligro bajo, estado normal |
| Ámbar precaución | `#ffa500` | Nivel de peligro medio, advertencias |
| Rojo peligro | `#ff4444` | Muerte, peligro alto, botón rendirse |
| Fondo oscuro | `#1a1a2e` | Fondo principal, cards |
| Slate textos | `#e0e0e0` | Textos principales |
| Gris secundario | `#888` | Labels, textos secundarios |

---

## 🛠️ Stack Tecnológico

- **Backend:** .NET 9 Web API con arquitectura de microservicios
- **API Gateway:** Ocelot 23.3 con ruteo por prefijo y CORS unificado
- **Frontend:** Angular 18 con Standalone Components, CSS Grid y animaciones CSS
- **Gráficos:** SVG gauge circular y barras de progreso personalizadas (sin librerías externas)
- **Base de Datos:** PostgreSQL 16 (vía Docker) con dos bases de datos independientes
- **ORM:** Entity Framework Core 9 con `EnsureCreated` para auto-migración
- **Persistencia:** JSONB para tablero y percepciones, tablas relacionales para acciones
- **Contenedores:** Docker + Docker Compose con healthchecks y dependencias entre servicios
- **Arquitectura:** Clean Architecture (Domain → Infrastructure → API) por cada microservicio

---

## 🏗️ Decisiones Arquitectónicas

| Decisión | Elección | Justificación |
|---|---|---|
| **Dos microservicios independientes** | GameEngine + LogService | Separación de responsabilidades: juego en tiempo real vs. consultas históricas. Cada uno con su propia base de datos |
| **Clean Architecture** | Domain / Infrastructure / API | La lógica de negocio (reglas del Wumpus) está aislada en Domain sin dependencias externas, facilitando testing y mantenibilidad |
| **API Gateway con Ocelot** | Sí | El frontend solo conoce una URL base. Ocelot enruta por prefijo y permite añadir rate limiting, auth, etc. en el futuro |
| **JSONB para tablero** | PostgreSQL JSONB | El tablero es un array 2D que no necesita consultas relacionales. JSONB permite guardarlo sin tablas de 100 celdas |
| **Auto-migración vs Migraciones formales** | `EnsureCreated` | Para portfolio y desarrollo local es más simple. En producción se usaría `dotnet ef migrations` con control de versiones |
| **Custom SVG Charts** | En vez de ngx-charts o Chart.js | Evita dependencias pesadas, demuestra capacidad de construir visualizaciones desde cero con SVG y CSS |
| **CSS Grid para el tablero** | Sí | Mapeo natural de grid 2D, responsive sin cálculos manuales de posición |
| **Standalone Components** | Angular 18 moderno | API actual de Angular, sin NgModules, mejor tree-shaking y lazy loading nativo |
| **GameEngineService como Singleton** | Sí | El motor no tiene estado; el estado vive en GameState que se pasa por parámetro. Un singleton evita crear el Random en cada request |

---

## 🧠 Lógica de Dominio Original (C++ → C#)

| Concepto C++ | Implementación C# | Descripción |
|---|---|---|
| `colocarEntidades()` | `BoardInitializer.PlaceEntities()` | Coloca Wumpus (1), Oro (1), Pozos (10) aleatoriamente evitando celda inicial (9,0) |
| `calcularPercepciones()` | `PerceptionCalculator.Calculate()` | Itera el tablero 10×10, propaga brisa/hedor a 4 vecinos (N/S/E/O) |
| `moverAgente(W/A/S/D)` | `GameEngineService.MoveAgent(Direction)` | Valida límites del tablero, actualiza posición, turno, visitado |
| `tomarOro()` | `GameEngineService.GrabGold()` | Verifica que el agente esté sobre celda con oro, lo recolecta, recalcula percepciones |
| `verificarEstado()` | `GameEngineService.CheckGameStatus()` | Evalúa: muerte por pozo, muerte por Wumpus, victoria (oro + regreso a F9 C0) |
| `idx(fila, col)` | `row * Cols + col` (en Perceptions) | Índice lineal para los arrays internos de percepciones |

---

## 🧹 Archivos que Pueden Eliminarse

Los siguientes archivos y carpetas son remanentes del proyecto C++ original y
pueden borrarse de forma segura, ya que no son utilizados por la nueva solución web:

| Archivo / Carpeta | Motivo |
|---|---|
| `Juego_Wumpus.cpp` | Código fuente C++ original. Conservar solo como referencia histórica |
| `build/` | Artefactos de compilación C++ (`Juego_Wumpus.o`, `outDebug.exe`). Eliminar por completo |
| `.vscode/c_cpp_properties.json` | Configuración de IntelliSense para C++. Reemplazar por config de .NET/Angular |
| `.vscode/launch.json` | Configuración de depuración C++. Reemplazar por launch para .NET |
| `.vscode/settings.json` | Configuración con rutas de compilador C++. Actualizar para el workspace .NET |

```bash
# Desde la raíz del repositorio (Mundo_Wumpus)
rm Juego_Wumpus.cpp
rm -rf build/
# El .vscode puede actualizarse o eliminarse según prefieras
```

> **Nota:** La nueva solución web está completamente contenida en `MundoWumpusWeb/`. Los archivos listados arriba están en la raíz del repositorio y son independientes.

---

## 👤 Autor

**Santiago Casas** — Desarrollador Backend .NET & Arquitecto de Microservicios

---

🤖 *Portfolio project built for a technical research role. Full-stack transformation from C++ console simulation to modern distributed web architecture.*
