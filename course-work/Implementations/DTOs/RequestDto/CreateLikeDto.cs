using System.ComponentModel.DataAnnotations;
namespace WebApi.DTOs;

public class LikeRequestDto
{
    public int UserId { get; set; }
    public int PostId { get; set; }
}