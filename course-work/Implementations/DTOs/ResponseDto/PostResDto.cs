namespace WebApi.DTOs;

public class PostResponseDto
{
    public int PostId { get; set; }
    public string AuthorName { get; set; } 
    public string Content { get; set; }
    public int AuthorId { get; set; } 
    public DateTime CreatedAt { get; set; }
   

    public List<CommentResponseDto> Comments { get; set; }
    public int LikesCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
}