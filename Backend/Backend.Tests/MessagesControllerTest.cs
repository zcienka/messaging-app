using Backend.Controllers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests
{
    public class MessagesControllerTest
    {
        [Fact]
        public async Task GetMessage()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "MessagingAppDb")
                .Options;
            using var context = new ApplicationDbContext(options);

            byte[] salt = new byte[32];
            string password = AuthController.PasswordCreator("password1", salt);
            User user1 = new User()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = "User1",
                PasswordHash = password,
                PasswordSalt = Convert.ToBase64String(salt)
            };
            context.Add(user1);
            context.SaveChanges();

            byte[] salt2 = new byte[32];

            User user2 = new User()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = "User2",
                PasswordHash = password,
                PasswordSalt = Convert.ToBase64String(salt2)
            };
            context.Add(user2);
            context.SaveChanges();
            string messageId = Guid.NewGuid().ToString();
            context.Add(new Message()
            {
                Id = messageId,
                Text = "Lorem ipsum",

            });
            context.SaveChanges();

            var controller = new MessagesController(context);
            Message? message_existing = null;
            Message? message_notExisting = null;


            message_existing = (await controller.GetMessage(messageId)).Value;
            message_notExisting = (await controller.GetMessage(Guid.NewGuid().ToString())).Value;

            Assert.NotNull(message_existing);
            Assert.Null(message_notExisting);
        }
    }
}
