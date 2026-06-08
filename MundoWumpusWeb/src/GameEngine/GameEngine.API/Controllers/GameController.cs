using GameEngine.Domain;
using GameEngine.Domain.Models;
using GameEngine.Domain.Services;
using GameEngine.Infrastructure.Persistence;
using GameEngine.Infrastructure.Persistence.Entities;
using GameEngine.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GameEngine.API.Controllers;

[ApiController]
[Route("api/game")]
public class GameController : ControllerBase
{
    private readonly GameEngineService _engineService;
    private readonly IGameRepository _repository;

    public GameController(GameEngineService engineService, IGameRepository repository)
    {
        _engineService = engineService;
        _repository = repository;
    }

    /// <summary>
    /// POST /api/game/new — Crea una nueva partida.
    /// </summary>
    [HttpPost("new")]
    public async Task<IActionResult> CreateNewGame()
    {
        var state = _engineService.CreateNewGame();
        var entity = GameStateMapper.ToEntity(state);
        await _repository.CreateAsync(entity);

        return Ok(new GameResponse
        {
            GameId = state.GameId,
            Status = state.Status.ToString(),
            Agent = new AgentDto(state.Agent),
            Board = state.Board.ToJaggedArray(),
            Perceptions = state.Perceptions.GetSnapshot(),
            VisitedPercentage = _engineService.CalculateVisitedPercentage(state),
            DangerLevel = _engineService.CalculateDangerLevel(state)
        });
    }

    /// <summary>
    /// POST /api/game/{id}/move — Mueve el agente en una dirección.
    /// </summary>
    [HttpPost("{id}/move")]
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveRequest request)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(new { error = "Partida no encontrada" });

        var state = GameStateMapper.ToDomain(entity);
        if (state.IsFinished)
            return BadRequest(new { error = "La partida ya ha terminado", status = state.Status.ToString() });

        bool valid = _engineService.MoveAgent(state, request.Direction);
        _engineService.UpdateGameStatus(state);

        // Persistir cambios
        var updatedEntity = GameStateMapper.ToEntity(state);
        await _repository.UpdateAsync(updatedEntity);

        return Ok(new GameResponse
        {
            GameId = state.GameId,
            Status = state.Status.ToString(),
            Agent = new AgentDto(state.Agent),
            Board = state.Board.ToJaggedArray(),
            Perceptions = state.Perceptions.GetSnapshot(),
            VisitedPercentage = _engineService.CalculateVisitedPercentage(state),
            DangerLevel = _engineService.CalculateDangerLevel(state),
            MoveValid = valid
        });
    }

    /// <summary>
    /// POST /api/game/{id}/grab — Recoge el oro.
    /// </summary>
    [HttpPost("{id}/grab")]
    public async Task<IActionResult> GrabGold(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(new { error = "Partida no encontrada" });

        var state = GameStateMapper.ToDomain(entity);
        if (state.IsFinished)
            return BadRequest(new { error = "La partida ya ha terminado", status = state.Status.ToString() });

        var result = _engineService.GrabGold(state);
        _engineService.UpdateGameStatus(state);

        var updatedEntity = GameStateMapper.ToEntity(state);
        await _repository.UpdateAsync(updatedEntity);

        return Ok(new GameResponse
        {
            GameId = state.GameId,
            Status = state.Status.ToString(),
            Agent = new AgentDto(state.Agent),
            Board = state.Board.ToJaggedArray(),
            Perceptions = state.Perceptions.GetSnapshot(),
            VisitedPercentage = _engineService.CalculateVisitedPercentage(state),
            DangerLevel = _engineService.CalculateDangerLevel(state),
            GrabResult = result.ToString()
        });
    }

    /// <summary>
    /// POST /api/game/{id}/surrender — El jugador se rinde.
    /// </summary>
    [HttpPost("{id}/surrender")]
    public async Task<IActionResult> Surrender(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(new { error = "Partida no encontrada" });

        var state = GameStateMapper.ToDomain(entity);
        _engineService.Surrender(state);

        var updatedEntity = GameStateMapper.ToEntity(state);
        await _repository.UpdateAsync(updatedEntity);

        return Ok(new GameResponse
        {
            GameId = state.GameId,
            Status = state.Status.ToString(),
            Agent = new AgentDto(state.Agent),
            Board = state.Board.ToJaggedArray(),
            Perceptions = state.Perceptions.GetSnapshot(),
            VisitedPercentage = _engineService.CalculateVisitedPercentage(state),
            DangerLevel = _engineService.CalculateDangerLevel(state)
        });
    }

    /// <summary>
    /// GET /api/game/{id} — Obtiene el estado actual de una partida.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameState(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(new { error = "Partida no encontrada" });

        var state = GameStateMapper.ToDomain(entity);

        return Ok(new GameResponse
        {
            GameId = state.GameId,
            Status = state.Status.ToString(),
            Agent = new AgentDto(state.Agent),
            Board = state.Board.ToJaggedArray(),
            Perceptions = state.Perceptions.GetSnapshot(),
            VisitedPercentage = _engineService.CalculateVisitedPercentage(state),
            DangerLevel = _engineService.CalculateDangerLevel(state),
            TotalTurns = state.TotalTurns,
            TotalActions = state.Actions.Count,
            Actions = state.Actions.Select(a => new ActionDto
            {
                TurnNumber = a.TurnNumber,
                Action = a.Action,
                Description = a.Description,
                Timestamp = a.Timestamp
            }).ToList()
        });
    }

    /// <summary>
    /// GET /api/game/{id}/perceptions — Tabla de percepciones.
    /// </summary>
    [HttpGet("{id}/perceptions")]
    public async Task<IActionResult> GetPerceptions(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            return NotFound(new { error = "Partida no encontrada" });

        var state = GameStateMapper.ToDomain(entity);
        var snapshot = state.Perceptions.GetSnapshot();

        // Solo retornar celdas con percepciones o visitadas
        var relevant = snapshot.Cells
            .Where(c => c.HasBreeze || c.HasStench || c.HasGlitter || c.IsVisited)
            .ToList();

        return Ok(relevant);
    }
}

// =============================================================
// DTOs para la API
// =============================================================

public class MoveRequest
{
    public Direction Direction { get; set; }
}

public class GameResponse
{
    public Guid GameId { get; set; }
    public string Status { get; set; } = string.Empty;
    public AgentDto Agent { get; set; } = new();
    public string[][] Board { get; set; } = Array.Empty<string[]>();
    public PerceptionSnapshot Perceptions { get; set; } = new();
    public double VisitedPercentage { get; set; }
    public int DangerLevel { get; set; }
    public int TotalTurns { get; set; }
    public int TotalActions { get; set; }
    public bool MoveValid { get; set; } = true;
    public string? GrabResult { get; set; }
    public List<ActionDto> Actions { get; set; } = new();
}

public class AgentDto
{
    public int Row { get; set; }
    public int Col { get; set; }
    public bool HasGold { get; set; }
    public int Turn { get; set; }

    public AgentDto() { }

    public AgentDto(Agent agent)
    {
        Row = agent.Row;
        Col = agent.Col;
        HasGold = agent.HasGold;
        Turn = agent.Turn;
    }
}

public class ActionDto
{
    public int TurnNumber { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
