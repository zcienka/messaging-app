using Backend.Models;
using Microsoft.Build.Framework;

namespace Backend.Requests
{
    public class MessageRequest
    {
        [Required] public string? Text { get; set; }
        [Required] public string? RoomId { get; set; }
    }
}
