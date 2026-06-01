using System.ComponentModel.DataAnnotations;
namespace WebApi.DTOs;

public class CreatePostDto
{
    [Required]
    [MinLength(10)]
    public string Content { get; set; }
}