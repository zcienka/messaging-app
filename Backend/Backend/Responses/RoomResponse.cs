using Backend.Models;
using Microsoft.Build.Framework;

namespace Backend.Responses
{
    public class RoomResponse
    {
        public string Id { get; set; }
        public List<string> Usernames { get; set; }
        public ApiResult<Message> Messages { get; set; }
        [Required] public string LastMessage { get; set; }
    }
}   