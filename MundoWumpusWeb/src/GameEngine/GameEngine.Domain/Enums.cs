using System.Text.Json.Serialization;

namespace GameEngine.Domain;

/// <summary>
/// Tipos de entidad que puede contener una celda del tablero.
/// </summary>
public enum CellType
{
    Empty = 0,
    Wumpus = 1,
    Gold = 2,
    Pit = 3
}

/// <summary>
/// Estados posibles del juego.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GameStatus
{
    InProgress = 0,
    Won = 1,
    DiedPit = 2,
    DiedWumpus = 3,
    Surrendered = 4
}

/// <summary>
/// Direcciones de movimiento del agente.
/// El JsonStringEnumConverter permite recibir "North", "South", etc.
/// desde el frontend en lugar de números 0, 1, 2, 3.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Direction
{
    North = 0,
    South = 1,
    West = 2,
    East = 3
}
