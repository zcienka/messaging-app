using Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IDictionary<string, UserConnection> _connections;

        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task JoinRoom(UserConnection userConnection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.RoomId);

            _connections[Context.ConnectionId] = userConnection;

            await Clients.Group(userConnection.RoomId).SendAsync("ReceiveMessage", "_botUser",
                $"{userConnection.Username} has joined {userConnection.RoomId}");

            await SendUsersConnected(userConnection.RoomId);
        }

        public Task SendUsersConnected(string roomId)
        {
            var users = _connections.Values
                .Where(c => c.RoomId == roomId)
                .Select(c => c.Username);

            return Clients.Group(roomId).SendAsync("UsersInRoom", users);
        }
    }
}