using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        // private IHubContext<HealthCheckHub> _hub;

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Messages
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages()
        {
            if (_context.Messages == null)
            {
                return NotFound();
            }

            var username = User?.FindFirst(ClaimTypes.Name).Value;
            IEnumerable<Message> messages = new List<Message>();

            if (string.IsNullOrEmpty(username))
            {
                return NotFound();
            }

            messages = _context.Messages.Where(x => x.AuthorUsername == username);
            return Ok(messages);
        }

        // GET: api/Messages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Message>> GetMessage(string id)
        {
            if (_context.Messages == null)
            {
                return NotFound();
            }

            var message = await _context.Messages.FindAsync(id);

            if (message == null)
            {
                return NotFound();
            }
                
            return message;
        }

        // PUT: api/Messages/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutMessage(string id, Message message)
        {
            if (id != message.Id)
            {
                return BadRequest();
            }

            _context.Entry(message).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessageExists(id))
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

        public bool UserNameExists(string username)
        {
            return (_context.Users?.Any(e => e.UserName == username)).GetValueOrDefault();
        }

        // POST: api/Messages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostMessage(Message message)
        {
            if (!UserNameExists(message.AuthorUsername))
            {
                return StatusCode(409, "Author username doesn't exist.");
            }

            if (!UserNameExists(message.ReceiverUsername))
            {
                return StatusCode(409, "Receiver username doesn't exist.");
            }

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
        }

        // DELETE: api/Messages/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteMessage(long id)
        {
            if (_context.Messages == null)
            {
                return NotFound();
            }

            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MessageExists(string id)
        {
            return (_context.Messages?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}