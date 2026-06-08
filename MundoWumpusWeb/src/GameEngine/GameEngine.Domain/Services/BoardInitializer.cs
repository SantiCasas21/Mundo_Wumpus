using GameEngine.Domain.Models;

namespace GameEngine.Domain.Services;

/// <summary>
/// Servicio de dominio: inicializa el tablero colocando Wumpus, Oro y Pozos
/// de forma aleatoria. Ninguna entidad puede ocupar la celda inicial del agente.
/// Equivalente a colocarEntidades() del código C++ original.
/// </summary>
public class BoardInitializer
{
    private readonly Random _random;

    public BoardInitializer()
    {
        _random = new Random();
    }

    /// <summary>Constructor para testing con seed fija.</summary>
    public BoardInitializer(int seed)
    {
        _random = new Random(seed);
    }

    /// <summary>
    /// Coloca todas las entidades en el tablero de forma aleatoria.
    /// </summary>
    public void PlaceEntities(Board board)
    {
        board.Clear();

        PlaceEntity(board, CellType.Wumpus, GameConstants.NumWumpus);
        PlaceEntity(board, CellType.Gold, GameConstants.NumGold);
        PlaceEntity(board, CellType.Pit, GameConstants.NumPits);
    }

    private void PlaceEntity(Board board, CellType entity, int count)
    {
        int placed = 0;
        while (placed < count)
        {
            int row = _random.Next(0, GameConstants.Rows);
            int col = _random.Next(0, GameConstants.Cols);

            // No colocar en celda inicial del agente ni sobre otra entidad
            if (board[row, col] == CellType.Empty
                && !(row == GameConstants.StartCell.Row && col == GameConstants.StartCell.Col))
            {
                board[row, col] = entity;
                placed++;
            }
        }
    }
}
