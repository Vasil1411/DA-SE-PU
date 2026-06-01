using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks; 
using WebApi.DTOs;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TeamsController : ControllerBase
{
    private readonly TeamService _teamService;

    public TeamsController(TeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpPost]
    [Authorize] 
    public async Task<IActionResult> Create(CreateTeamDto dto) 
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim.Value);

        await _teamService.CreateAsync(dto, userId); 
        return Ok(new { message = "Отборът е създаден успешно!" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams p, [FromQuery] string? searchTerm) 
    {
        var teams = await _teamService.GetAllTeamsAsync(p, searchTerm); 
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) 
    {
        var team = await _teamService.GetTeamByIdAsync(id); 
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, CreateTeamDto dto) 
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        var success = await _teamService.UpdateAsync(id, userId, dto); 

        if (!success) return Forbid(); 

        return Ok(new { message = "Отборът е обновен!" });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id) 
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        var success = await _teamService.DeleteAsync(id, userId); 

        if (!success) return Forbid();

        return Ok(new { message = "Отборът е изтрит!" });
    }
}