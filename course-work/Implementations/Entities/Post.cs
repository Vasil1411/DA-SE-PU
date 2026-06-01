namespace WebApi.Entities;

public class Post 
{
      public int PostId { get; set; }

      public string Content { get; set; }

      public DateTime CreatedAt { get; set; }

      public int UserId { get; set; }

      public User User { get; set; }
      
      public int TeamId { get; set; }

      public Team Team { get; set; }

      public ICollection<Comment> Comments { get; set; }
      public ICollection<PostLike> PostLikes { get; set; } 
}