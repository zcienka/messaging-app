using Backend.Models;
using Microsoft.Build.Framework;

namespace Backend.Requests
{
    public class MessageRequest
    {
        [Required] public string? AuthorUsername { get; set; }
        [Required] public string? RoomId { get; set; }

        [Required] public string? Text { get; set; }
    }
}