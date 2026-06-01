namespace WebApi.DTOs;

public class CommentResponseDto
    {
        public int CommentId { get; set; }
        public string Content { get; set; } 
        public DateTime CreatedAt { get; set; }
        public int AuthorId { get; set; }   
        public string AuthorName { get; set; } 
    }