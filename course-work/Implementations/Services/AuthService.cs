using System.Linq;
using System.Threading.Tasks; 
using Microsoft.EntityFrameworkCore; 
using WebApi.Data;
using WebApi.DTOs;
using WebApi.Entities;

namespace WebApi.Services;

public class UserService
{
    private readonly FootballForumDbContext _context;

    public UserService(FootballForumDbContext context)
    {
        _context = context;
    }

    public async Task RegisterAsync(RegisterRequest dto) 
    {
        
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
        {
            throw new ArgumentException("Username or Email already taken!");
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            Password = dto.Password 
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(); 
    }

    public async Task<User> GetUserByUsernameAsync(string username)
    {
        
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

   
}