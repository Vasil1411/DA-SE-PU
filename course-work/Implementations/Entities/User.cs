namespace WebApi.Entities;
using System.ComponentModel.DataAnnotations;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } 
    [EmailAddress]
    [Required]
    public string Email { get; set; } 
    public string Password { get; set; }
    
    public ICollection<Post> Posts { get; set; }
    public ICollection<Comment> Comments { get; set; }
    public ICollection<PostLike> PostLikes { get; set; }
    public ICollection<Team> MyTeams { get; set; }
}
