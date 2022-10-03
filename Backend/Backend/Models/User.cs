using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace Backend.Models
{
    public class User : IdentityUser
    {
        public override string Id { get; set; } = Guid.NewGuid().ToString("N");

        public override string? UserName { get; set; } = null!;

        public string PasswordSalt { get; set; } = null!;
    }
}
