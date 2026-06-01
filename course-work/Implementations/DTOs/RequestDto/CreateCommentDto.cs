using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; 
namespace WebApi.DTOs;

public class CreateCommentDto
{
    [Required]
    [MinLength(5)]
    [JsonPropertyName("content")]
    public string Content { get; set; }
}