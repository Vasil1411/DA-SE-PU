using System.ComponentModel.DataAnnotations;
namespace WebApi.DTOs;

public class CreateTeamDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [Required]
    [MaxLength(50)]
    public string Country { get; set; }
}