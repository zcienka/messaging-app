namespace Backend.Models
{
    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string User1 { get; set; }
        public string User2 { get; set; }
        public List<Message> Messages { get; set; }
    }
}