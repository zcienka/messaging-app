using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Message
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        [Required] public string? Text { get; set; }
        [Required] public string AuthorUsername { get; set; }
        [Required] public string ReceiverUsername { get; set; }
    }
}