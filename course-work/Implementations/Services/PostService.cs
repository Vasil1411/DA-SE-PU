using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks; 
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.DTOs;
using WebApi.Entities;

namespace WebApi.Services;

public class PostService
{
    private readonly FootballForumDbContext _context;

    public PostService(FootballForumDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(CreatePostDto dto, int teamId, int userId)
    {
        var post = new Post
        {
            Content = dto.Content,
            TeamId = teamId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync(); 
    }

    public async Task<PagedResult<PostResponseDto>> GetAllPostsAsync(PaginationParams p, string? searchTerm)
    {
    var query = _context.Posts.AsQueryable();

    // Филтриране
    if (!string.IsNullOrWhiteSpace(searchTerm))
    {
        query = query.Where(post => post.Content.Contains(searchTerm) || post.User.Username.Contains(searchTerm));
    }

    
    query = p.SortBy?.ToLower() switch
    {
        "content" => p.SortDescending ? query.OrderByDescending(x => x.Content) : query.OrderBy(x => x.Content),
        "createdat" => p.SortDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
        _ => query.OrderByDescending(x => x.CreatedAt) 
    };

    var totalCount = await query.CountAsync();
    
    var items = await query
        .Skip((p.PageNumber - 1) * p.PageSize)
        .Take(p.PageSize)
        .Select(p => new PostResponseDto {
            PostId = p.PostId,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            AuthorName = p.User.Username,
            AuthorId = p.UserId
        }).ToListAsync();

    return new PagedResult<PostResponseDto>(items, totalCount, p.PageNumber, p.PageSize);
    }
    
public async Task<List<PostResponseDto>> GetPostsByTeamAsync(int teamId, int currentUserId)
{
    return await _context.Posts
        .Where(p => p.TeamId == teamId)
        .Select(p => new PostResponseDto
        {
            PostId = p.PostId,
            Content = p.Content,
            AuthorName = p.User.Username, 
            AuthorId = p.UserId, 
            CreatedAt = p.CreatedAt,    
            LikesCount = p.PostLikes.Count(),
            IsLikedByCurrentUser = p.PostLikes.Any(pl => pl.UserId == currentUserId),
            Comments = p.Comments.Select(c => new CommentResponseDto
            {
                CommentId = c.Id, 
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorName = c.User.Username,
                AuthorId = c.UserId
            }).ToList()
        })
        .ToListAsync();
}
    
    public async Task DeleteAsync(int postId, int userId)
    {
        var post = await _context.Posts.FindAsync(postId); 
        if (post != null && post.UserId == userId)
        {
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> UpdateAsync(int postId, int userId, CreatePostDto dto)
    {
        var post = await _context.Posts.FindAsync(postId);

        if (post == null || post.UserId != userId)
        {
            return false; 
        }

        post.Content = dto.Content;
        await _context.SaveChangesAsync(); 
        return true; 
    }

    public async Task<PostResponseDto?> GetPostByIdAsync(int postId)
    {
        var post = await _context.Posts
            .Include(p => p.User)        
            .Include(p => p.Comments)  
            .ThenInclude(c => c.User)  
            .FirstOrDefaultAsync(p => p.PostId == postId); 

        if (post == null) return null;

        return new PostResponseDto
        {
            PostId = post.PostId,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            AuthorName = post.User.Username,
            AuthorId = post.UserId,
            Comments = post.Comments.Select(c => new CommentResponseDto
            {
                CommentId = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorName = c.User.Username,
                AuthorId = c.UserId
            }).ToList()
        };
    }
}