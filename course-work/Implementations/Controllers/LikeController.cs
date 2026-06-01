using Microsoft.AspNetCore.Mvc;
using WebApi.DTOs;
using WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LikesController : ControllerBase
{
 
    private readonly LikeService _likeService;

    public LikesController(LikeService likeService)
    {
        _likeService = likeService;
    }

    [Authorize]
    [HttpPost("like")]
    public async Task<ActionResult<LikeResponseDto>> Like([FromBody] LikeRequestDto request)
    {
       
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        request.UserId = userId;

        var response = await _likeService.LikePostAsync(request);
       
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }

        
        return Ok(response);
    }

    [Authorize]
    [HttpPost("unlike")]
    public async Task<ActionResult<LikeResponseDto>> Unlike([FromBody] LikeRequestDto request)
    {

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        request.UserId = userId;

        var response = await _likeService.UnlikePostAsync(request);

        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}