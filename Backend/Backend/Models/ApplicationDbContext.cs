using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        // public ApplicationDbContext() : base()
        // {
        // }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }   

        public DbSet<Message> Messages => Set<Message>();
        public override DbSet<User> Users => Set<User>();
        protected override void OnModelCreating(ModelBuilder builder)
        {
            // // builder.Entity<User>()
            //     // .HasIndex(u => u.UserName)
            //     // .IsUnique();
            //
            // builder.Entity<User>(entity => {
            //     entity.HasIndex(e => e.UserName).IsUnique();
            // });
            base.OnModelCreating(builder);
        }
    }
}