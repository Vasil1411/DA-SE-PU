using System.ComponentModel.DataAnnotations;
namespace WebApi.DTOs;

public class LoginRequest
{
    [Required]
    public string Username { get; set; } 
    [Required]
    public string Password { get; set; } 
}


public class RegisterRequest
{   
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } 
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } 

    [Required]
    [MinLength(6)]
    public string Password { get; set; } 
}