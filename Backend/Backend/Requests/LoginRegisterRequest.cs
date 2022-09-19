using Microsoft.Build.Framework;

namespace Backend.Requests
{
    public class LoginRegisterRequest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string? UserName { get; set; } = null!;

        public string? Password { get; set; } = null!;
    }
}