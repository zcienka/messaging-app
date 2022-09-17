using Microsoft.Build.Framework;

namespace Backend.Requests
{
    public class LoginRegisterRequest
    {
        public string? UserName { get; set; } = null!;

        public string? Password { get; set; } = null!;
    }
}