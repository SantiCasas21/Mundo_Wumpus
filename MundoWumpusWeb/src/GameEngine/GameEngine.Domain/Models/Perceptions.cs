namespace GameEngine.Domain.Models;

/// <summary>
/// Percepciones del agente en cada celda:
/// - Brisa: hay un pozo adyacente
/// - Hedor: el Wumpus está adyacente
/// - Brillo: el oro está en esta misma celda
/// </summary>
public class Perceptions
{
    private readonly bool[] _breeze;
    private readonly bool[] _stench;
    private readonly bool[] _glitter;
    private readonly bool[] _visited;

    public Perceptions()
    {
        int total = GameConstants.TotalCells;
        _breeze = new bool[total];
        _stench = new bool[total];
        _glitter = new bool[total];
        _visited = new bool[total];
    }

    private static int Index(int row, int col) => row * GameConstants.Cols + col;

    public bool HasBreeze(int row, int col) => _breeze[Index(row, col)];
    public bool HasStench(int row, int col) => _stench[Index(row, col)];
    public bool HasGlitter(int row, int col) => _glitter[Index(row, col)];
    public bool IsVisited(int row, int col) => _visited[Index(row, col)];

    public void SetBreeze(int row, int col, bool value) => _breeze[Index(row, col)] = value;
    public void SetStench(int row, int col, bool value) => _stench[Index(row, col)] = value;
    public void SetGlitter(int row, int col, bool value) => _glitter[Index(row, col)] = value;
    public void SetVisited(int row, int col, bool value) => _visited[Index(row, col)] = value;

    /// <summary>Limpia todas las percepciones.</summary>
    public void ClearAll()
    {
        Array.Fill(_breeze, false);
        Array.Fill(_stench, false);
        Array.Fill(_glitter, false);
    }

    /// <summary>Resetea todo: percepciones y celdas visitadas.</summary>
    public void ResetAll()
    {
        ClearAll();
        Array.Fill(_visited, false);
    }

    /// <summary>
    /// Retorna un snapshot de las percepciones para serialización.
    /// </summary>
    public PerceptionSnapshot GetSnapshot()
    {
        var cells = new PerceptionCell[GameConstants.TotalCells];
        for (int r = 0; r < GameConstants.Rows; r++)
            for (int c = 0; c < GameConstants.Cols; c++)
            {
                int i = Index(r, c);
                cells[i] = new PerceptionCell
                {
                    Row = r,
                    Col = c,
                    HasBreeze = _breeze[i],
                    HasStench = _stench[i],
                    HasGlitter = _glitter[i],
                    IsVisited = _visited[i]
                };
            }
        return new PerceptionSnapshot { Cells = cells };
    }
}

public class PerceptionCell
{
    public int Row { get; set; }
    public int Col { get; set; }
    public bool HasBreeze { get; set; }
    public bool HasStench { get; set; }
    public bool HasGlitter { get; set; }
    public bool IsVisited { get; set; }
}

public class PerceptionSnapshot
{
    public PerceptionCell[] Cells { get; set; } = Array.Empty<PerceptionCell>();
}
