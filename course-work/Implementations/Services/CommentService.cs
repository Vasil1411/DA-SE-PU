using System;
using System.Threading.Tasks; 
using Microsoft.EntityFrameworkCore; 
using WebApi.Data;
using WebApi.DTOs;
using WebApi.Entities;

namespace WebApi.Services;

public class CommentService
{
    private readonly FootballForumDbContext _context;

    public CommentService(FootballForumDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(CreateCommentDto dto, int postId, int userId)
    {
        var comment = new Comment
        {
            Content = dto.Content,
            PostId = postId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(); 
    }

    public async Task<bool> UpdateAsync(int commentId, int userId, CreateCommentDto dto)
    {
        
        var comment = await _context.Comments.FindAsync(commentId);

        if (comment == null || comment.UserId != userId)
        {
            return false; 
        }

        comment.Content = dto.Content;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int commentId, int userId)
    {
        
        var comment = await _context.Comments.FindAsync(commentId);

        if (comment == null || comment.UserId != userId)
        {
            return false; 
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync(); 
        return true;
    }
}