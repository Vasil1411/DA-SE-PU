namespace WebApi.Entities;


public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } 
    public string Country { get; set; } 
    public int CreatorId { get; set; }
    public User Creator { get; set; }
    
    public ICollection<Post> Posts { get; set; }
   
}