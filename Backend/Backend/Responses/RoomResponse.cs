using Backend.Models;

namespace Backend.Responses
{
    public class RoomResponse
    {
        public string Id { get; set; }
        public List<string> Usernames { get; set; }
        public ApiResult<Message> Messages { get; set; }
    }
}   