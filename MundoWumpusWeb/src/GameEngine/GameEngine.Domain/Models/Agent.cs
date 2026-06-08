namespace GameEngine.Domain.Models;

/// <summary>
/// Representa el agente/explorador dentro del mundo de Wumpus.
/// </summary>
public class Agent
{
    public int Row { get; set; }
    public int Col { get; set; }
    public bool HasGold { get; set; }
    public int Turn { get; set; }

    public Agent()
    {
        Row = GameConstants.StartCell.Row;
        Col = GameConstants.StartCell.Col;
        HasGold = false;
        Turn = 0;
    }

    public int LinearIndex() => Row * GameConstants.Cols + Col;

    public bool IsAtStart() => Row == GameConstants.StartCell.Row
                            && Col == GameConstants.StartCell.Col;
}
