namespace Backend.Models
{
    public class PagingQuery
    {
        // public string? Id { get; set; } = null;
        public string Limit { get; set; } = "10";
        public string Offset { get; set; } = "0";
    }
}