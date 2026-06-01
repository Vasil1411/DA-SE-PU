using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks; 
using WebApi.Data;
using WebApi.DTOs;
using WebApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Services;

public class TeamService
{
    private readonly FootballForumDbContext _context;

    public TeamService(FootballForumDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(CreateTeamDto dto, int userId)
    {
        var team = new Team
        {
            Name = dto.Name,
            Country = dto.Country,
            CreatorId = userId
        };
        _context.Teams.Add(team);
        await _context.SaveChangesAsync(); 
    }

 public async Task<PagedResult<TeamResponseDto>> GetAllTeamsAsync(PaginationParams p, string? searchTerm)
{
    var query = _context.Teams.AsQueryable();

    if (!string.IsNullOrWhiteSpace(searchTerm))
    {
        query = query.Where(t => t.Name.Contains(searchTerm) || t.Country.Contains(searchTerm));
    }

    
    query = p.SortBy?.ToLower() switch
    {
        "name" => p.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
        "country" => p.SortDescending ? query.OrderByDescending(t => t.Country) : query.OrderBy(t => t.Country),
        _ => query.OrderBy(t => t.Name) 
    };

    var totalCount = await query.CountAsync();

    var items = await query
        .Skip((p.PageNumber - 1) * p.PageSize)
        .Take(p.PageSize)
        .Select(t => new TeamResponseDto
        {
            TeamId = t.Id,
            Name = t.Name,
            Country = t.Country,
            CreatorName = t.Creator.Username
        })
        .ToListAsync();

    return new PagedResult<TeamResponseDto>(items, totalCount, p.PageNumber, p.PageSize);
}

    public async Task<TeamResponseDto?> GetTeamByIdAsync(int id)
    {
        return await _context.Teams
            .Where(t => t.Id == id)
            .Select(t => new TeamResponseDto
            {
                TeamId = t.Id,
                Name = t.Name,
                Country = t.Country,
                CreatorName = t.Creator.Username
            })
            .FirstOrDefaultAsync(); 
    }

    public async Task<bool> UpdateAsync(int teamId, int userId, CreateTeamDto dto)
    {
        var team = await _context.Teams.FindAsync(teamId); 

        if (team == null || team.CreatorId != userId)
        {
            return false;
        }

        team.Name = dto.Name;
        team.Country = dto.Country;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int teamId, int userId)
    {
        var team = await _context.Teams.FindAsync(teamId); 

        if (team == null || team.CreatorId != userId)
        {
            return false;
        }

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync(); 
        return true;
    }
}