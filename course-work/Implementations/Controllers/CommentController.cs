using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks; 
using WebApi.DTOs;
using WebApi.Services;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly CommentService _commentService;

    public CommentsController(CommentService commentService)
    {
        _commentService = commentService;
    }

    [Authorize]
    [HttpPost("create/{postId}")]
    public async Task<IActionResult> Create(int postId, [FromBody] CreateCommentDto dto) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        await _commentService.CreateAsync(dto, postId, userId); // await
        return Ok("Comment added.");
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCommentDto dto) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        bool success = await _commentService.UpdateAsync(id, userId, dto); 
        
        if (!success) return BadRequest("Cannot update: Comment not found or not yours.");

        return Ok("Comment updated.");
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) 
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        bool success = await _commentService.DeleteAsync(id, userId); 
        
        if (!success) return BadRequest("Cannot delete: Comment not found or not yours.");

        return Ok("Comment deleted.");
    }
}