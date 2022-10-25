using Microsoft.Build.Framework;

namespace Backend.Responses
{
    public class MessageResponse
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        [Required] public string? Text { get; set; }
        [Required] public string AuthorUsername { get; set; }
        public DateTime Created { get; set; }
    }
}
