using GameEngine.Domain.Models;

namespace GameEngine.Domain.Services;

/// <summary>
/// Servicio de dominio: calcula las percepciones para todas las celdas.
/// - Brisa: celdas adyacentes a un pozo.
/// - Hedor: celdas adyacentes al Wumpus.
/// - Brillo: celda que contiene el oro.
/// Equivalente a calcularPercepciones() del código C++ original.
/// </summary>
public class PerceptionCalculator
{
    // 4 direcciones: Norte, Sur, Oeste, Este
    private static readonly int[] DeltaRow = { -1, 1, 0, 0 };
    private static readonly int[] DeltaCol = { 0, 0, -1, 1 };

    /// <summary>
    /// Recalcula todas las percepciones basándose en el estado actual del tablero.
    /// </summary>
    public void Calculate(Board board, Perceptions perceptions)
    {
        perceptions.ClearAll();

        for (int row = 0; row < GameConstants.Rows; row++)
        {
            for (int col = 0; col < GameConstants.Cols; col++)
            {
                CellType cell = board[row, col];

                // Brillo: misma celda que el oro
                if (cell == CellType.Gold)
                {
                    perceptions.SetGlitter(row, col, true);
                }

                // Brisa/Hedor: se propagan a las celdas adyacentes desde pozos y Wumpus
                if (cell == CellType.Pit || cell == CellType.Wumpus)
                {
                    PropagatePerception(board, perceptions, row, col, cell);
                }
            }
        }
    }

    /// <summary>
    /// Propaga brisa (pozo) o hedor (Wumpus) a las 4 celdas adyacentes.
    /// </summary>
    private static void PropagatePerception(Board board, Perceptions perceptions,
        int row, int col, CellType source)
    {
        for (int d = 0; d < 4; d++)
        {
            int neighborRow = row + DeltaRow[d];
            int neighborCol = col + DeltaCol[d];

            if (IsWithinBounds(neighborRow, neighborCol))
            {
                if (source == CellType.Pit)
                    perceptions.SetBreeze(neighborRow, neighborCol, true);
                else if (source == CellType.Wumpus)
                    perceptions.SetStench(neighborRow, neighborCol, true);
            }
        }
    }

    /// <summary>
    /// Verifica si una posición está dentro de los límites del tablero.
    /// </summary>
    public static bool IsWithinBounds(int row, int col)
    {
        return row >= 0 && row < GameConstants.Rows
            && col >= 0 && col < GameConstants.Cols;
    }
}
