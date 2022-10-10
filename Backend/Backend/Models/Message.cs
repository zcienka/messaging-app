using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Message
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        [Required] public string? Text { get; set; }
        [Required] public string RoomId { get; set; }
        [Required] public string AuthorUsername { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
    }
}   