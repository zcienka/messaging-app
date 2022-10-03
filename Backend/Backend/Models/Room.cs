namespace Backend.Models
{
    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public List<string> Usernames { get; set; } = new List<string>();
    }
}