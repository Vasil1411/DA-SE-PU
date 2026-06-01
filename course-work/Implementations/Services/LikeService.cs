using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.DTOs;
using WebApi.Entities;

namespace WebApi.Services;

public class LikeService
{
    private readonly FootballForumDbContext _context;

   
    public LikeService(FootballForumDbContext context)
    {
        _context = context;
    }

   
    public async Task<LikeResponseDto> LikePostAsync(LikeRequestDto request)
    {
        
        var exists = await _context.PostLikes
            .AnyAsync(pl => pl.UserId == request.UserId && pl.PostId == request.PostId);

        if (exists)
        {
            return new LikeResponseDto 
            { 
                IsSuccess = false, 
                Message = "Вече сте харесали този пост!" 
            };
        }

       
        var like = new PostLike
        {
            UserId = request.UserId,
            PostId = request.PostId
        };

        _context.PostLikes.Add(like);
        await _context.SaveChangesAsync();

        
        return new LikeResponseDto 
        { 
            IsSuccess = true, 
            Message = "Успешно харесахте поста." 
        };
    }

    
    public async Task<LikeResponseDto> UnlikePostAsync(LikeRequestDto request)
    {
        var like = await _context.PostLikes
            .FirstOrDefaultAsync(pl => pl.UserId == request.UserId && pl.PostId == request.PostId);

        if (like == null)
        {
            return new LikeResponseDto 
            { 
                IsSuccess = false, 
                Message = "Лайкът не е намерен." 
            };
        }

        _context.PostLikes.Remove(like);
        await _context.SaveChangesAsync();

        return new LikeResponseDto 
        { 
            IsSuccess = true, 
            Message = "Лайкът е премахнат успешно." 
        };
    }
}