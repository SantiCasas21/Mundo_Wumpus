using System.Text.Json;

namespace GameEngine.Domain;

/// <summary>
/// Configuración del tablero: dimensiones y cantidades de entidades.
/// Estos valores son inmutables y definen las reglas del juego.
/// </summary>
public static class GameConstants
{
    public const int Rows = 10;
    public const int Cols = 10;
    public const int TotalCells = Rows * Cols; // 100

    public const int NumPits = 10;
    public const int NumWumpus = 1;
    public const int NumGold = 1;

    /// <summary>Celda de inicio del agente: esquina inferior izquierda (sur-oeste).</summary>
    public static readonly (int Row, int Col) StartCell = (Rows - 1, 0);

    /// <summary>Límite máximo de acciones registradas en memoria.</summary>
    public const int MaxActions = 600;
}
