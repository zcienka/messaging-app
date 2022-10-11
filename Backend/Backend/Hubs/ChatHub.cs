using Backend.Models;
using Backend.Requests;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private readonly IDictionary<string, UserConnection> _connections;

        public ChatHub(ApplicationDbContext context, IDictionary<string, UserConnection> connections)
        {
            _context = context;
            _connections = connections;
        }

        public async Task SendMessage(MessageRequest requestMessage)
        {
            Message message = new Message
            {
                Text = requestMessage.Text,
                RoomId = requestMessage.RoomId,
                AuthorUsername = requestMessage.AuthorUsername
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            await Clients.Group(requestMessage.RoomId).SendAsync("ReceiveMessage", message);
        }

        public async Task JoinRoom(UserConnection userConnection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room);

            _connections[Context.ConnectionId] = userConnection;
            await SendUsersConnected(userConnection.Room);
        }

        public Task SendUsersConnected(string roomId)
        {
            var users = _connections.Values
                .Where(c => c.Room == roomId)
                .Select(c => c.User);
        
            return Clients.Group(roomId).SendAsync("UsersInRoom", users);
        }
    }
}