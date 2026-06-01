using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks; 
using WebApi.DTOs;
using WebApi.JWT;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly JwtTokenGenerator _jwtGenerator; 

    public UsersController(UserService userService, JwtTokenGenerator jwtGenerator)
    {
        _userService = userService;
        _jwtGenerator = jwtGenerator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto) 
    {
        try
        {
            await _userService.RegisterAsync(dto); 
            return Ok("User registered successfully!");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto) 
    {
       
        var user = await _userService.GetUserByUsernameAsync(dto.Username);

        if (user == null || user.Password != dto.Password)
        {
            return Unauthorized("Invalid username or password.");
        }

        string token = _jwtGenerator.GenerateToken(user.Id, user.Username);

        return Ok(new { Token = token });
    }

  
}