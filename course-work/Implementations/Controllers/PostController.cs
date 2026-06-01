using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks; 
using WebApi.DTOs;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PostsController : ControllerBase
{
    private readonly PostService _postService;

    public PostsController(PostService postService)
    {
        _postService = postService;
    }

 [HttpGet("team/{teamId}")]
public async Task<IActionResult> GetByTeam(int teamId)
{
    int currentUserId = 0;
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    if (userIdClaim != null)
    {
        currentUserId = int.Parse(userIdClaim);
    }

    
    var posts = await _postService.GetPostsByTeamAsync(teamId, currentUserId); 
    return Ok(posts);
}

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationParams p, [FromQuery] string? searchTerm) 
    {
        var result = await _postService.GetAllPostsAsync(p, searchTerm); 
        return Ok(result);
    }

    [Authorize]
    [HttpPost("create/{teamId}")]
    public async Task<IActionResult> Create(int teamId, [FromBody] CreatePostDto dto) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        
        await _postService.CreateAsync(dto, teamId, userId); 
        
        return Ok("Post created successfully.");
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePostDto dto) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        bool success = await _postService.UpdateAsync(id, userId, dto); 

        if (!success)
        {
            return BadRequest("Post not found or you are not the owner.");
        }

        return Ok("Post updated.");
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        await _postService.DeleteAsync(id, userId); // await
        
        return Ok("Post deleted (if existed and was yours).");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostDetails(int id) 
    {
        var post = await _postService.GetPostByIdAsync(id); 

        if (post == null)
        {
            return NotFound("Post not found");
        }

        return Ok(post);
    }
}