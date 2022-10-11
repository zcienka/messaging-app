namespace Backend.Models
{
    public class PagingQuery
    {
        public string Limit { get; set; } = "10";
        public string Offset { get; set; } = "0";
    }
}