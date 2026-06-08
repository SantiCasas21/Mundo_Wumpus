namespace GameEngine.Domain.Models;

/// <summary>
/// Tablero interno que guarda el estado real del mundo (entidades).
/// </summary>
public class Board
{
    private readonly CellType[,] _cells;

    public int Rows => GameConstants.Rows;
    public int Cols => GameConstants.Cols;

    public Board()
    {
        _cells = new CellType[GameConstants.Rows, GameConstants.Cols];
    }

    public CellType this[int row, int col]
    {
        get => _cells[row, col];
        set => _cells[row, col] = value;
    }

    /// <summary>Limpia todo el tablero: todas las celdas quedan vacías.</summary>
    public void Clear()
    {
        for (int r = 0; r < GameConstants.Rows; r++)
            for (int c = 0; c < GameConstants.Cols; c++)
                _cells[r, c] = CellType.Empty;
    }

    /// <summary>Retorna una copia del tablero para serialización segura.</summary>
    public CellType[,] GetSnapshot()
    {
        var copy = new CellType[GameConstants.Rows, GameConstants.Cols];
        Array.Copy(_cells, copy, _cells.Length);
        return copy;
    }

    /// <summary>
    /// Serializa el tablero como array 2D en JSON para persistencia.
    /// Se convierte a array de strings para que sea legible.
    /// </summary>
    public string[][] ToJaggedArray()
    {
        var result = new string[GameConstants.Rows][];
        for (int r = 0; r < GameConstants.Rows; r++)
        {
            result[r] = new string[GameConstants.Cols];
            for (int c = 0; c < GameConstants.Cols; c++)
            {
                result[r][c] = _cells[r, c] switch
                {
                    CellType.Empty => ".",
                    CellType.Wumpus => "W",
                    CellType.Gold => "O",
                    CellType.Pit => "P",
                    _ => "."
                };
            }
        }
        return result;
    }
}
