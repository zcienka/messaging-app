using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Backend.Responses;
using System.Reflection.Metadata;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Route("api/room")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoomsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Room?limit=10&offset=0
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ApiResult<Room>>> GetRooms([FromQuery] PagingQuery query)
        {
            var username = User?.FindFirst("username").Value;
        
            if (string.IsNullOrEmpty(username) || !int.TryParse(query.Limit, out int limitInt)
                                               || !int.TryParse(query.Offset, out int offsetInt))
            {
                return NotFound();
            }
        
            IQueryable<Room> rooms = _context.Rooms.AsNoTracking()
                .Where(r => r.Usernames.Contains(username));
            
            var url = "/room";

            return await ApiResult<Room>.CreateAsync(
                rooms,
                offsetInt,
                limitInt,
                url
            );
        }

        // GET: api/Room/5?limit=10&offset=0
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<RoomResponse>> GetRoom(string id, [FromQuery] PagingQuery query)
        {
            var username = User?.FindFirst("username").Value;
            var room = await _context.Rooms.FindAsync(id);
        
        
            if (room == null ||
                string.IsNullOrEmpty(username) ||
                !int.TryParse(query.Limit, out int limitInt) ||
                !int.TryParse(query.Offset, out int offsetInt))
            {
                return NotFound();
            }
        
            if (!room.Usernames.Contains(username))
            {
                return Forbid();
            }
        
            var reversedMessages = _context.Messages.OrderByDescending(o => o.Created);
        
            IQueryable<Message> messages = reversedMessages
                .Where(r => r.RoomId.Equals(id));
        
            var url = $"/room/{id}";

            var pagedMessages = await ApiResult<Message>.CreateAsync(
                messages,
                offsetInt,
                limitInt,
                url
            );
        
            RoomResponse roomResponse = new RoomResponse()
            {
                Id = id,
                Usernames = room.Usernames,
                Messages = pagedMessages,
                LastMessage = room.LastMessage
            };
        
            return roomResponse;
        }

        // PUT: api/Room/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutRoom(string id, Room room)
        {
            if (id != room.Id)
            {
                return BadRequest();
            }

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool UserNameExists(string username)
        {
            return (_context.Users?.Any(e => e.UserName == username)).GetValueOrDefault();
        }

        // POST: api/Room
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Room>> PostRoom(List<string> usernames)
        {
            bool usernamesAreUnique = usernames.Distinct().Count() == usernames.Count();
            if (!usernamesAreUnique)
            {
                return StatusCode(409, "Usernames must be unique.");
            }

            foreach (string username in usernames)
            {
                if (!UserNameExists(username))
                {
                    return StatusCode(409, $"User '{username}' doesn't exist.");
                }
            }

            Room room = new Room()
            {
                Usernames = usernames
            };

            _context.Rooms.Add(room);
            // await _context.SaveChangesAsync();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RoomExists(room.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }
            
            return CreatedAtAction("GetRoom", new { id = room.Id }, room);
        }

        // DELETE: api/Room/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRoom(string id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(string id)
        {
            return _context.Rooms.Any(e => e.Id == id);
        }
    }
}