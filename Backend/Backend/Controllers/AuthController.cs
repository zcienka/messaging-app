﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Backend.Models;
using Backend.Requests;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHandler _jwtHandler;

        public AuthController(
            ApplicationDbContext context,
            JwtHandler jwtHandler
        )
        {
            _context = context;
            _jwtHandler = jwtHandler;
        }

        public static string PasswordCreator(string password, byte[] salt)
        {
            string pw = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 256 / 8
            ));

            return pw;
        }

        private static byte[] GenerateSaltNewInstance(int size)
        {
            using (var generator = RandomNumberGenerator.Create())
            {
                var salt = new byte[size];
                generator.GetBytes(salt);
                return salt;
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(LoginRegisterRequest request,
            [FromServices] IValidator<LoginRegisterRequest> validator)
        {
            ValidationResult validationResult = validator.Validate(request);

            if (!validationResult.IsValid)
            {
                var modelStateDictionary = new ModelStateDictionary();
                foreach (ValidationFailure failure in validationResult.Errors)
                {
                    modelStateDictionary.AddModelError(failure.PropertyName,
                        failure.ErrorMessage);
                }

                return ValidationProblem(modelStateDictionary);
            }
            
            if (UserNameExists(request.UserName))
            {
                return StatusCode(409);
            }

            var salt = GenerateSaltNewInstance(32);
            string password = PasswordCreator(request.Password, salt);
            var user = new User
                { UserName = request.UserName, PasswordHash = password, PasswordSalt = Convert.ToBase64String(salt) };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRegisterRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(p => p.UserName == request.UserName);

            if (user == null)
            {
                return Unauthorized(new LoginResult()
                {
                    Success = false
                });
            }

            var saltedByte = Convert.FromBase64String(user.PasswordSalt);
            var passwordSubmitted = PasswordCreator(request.Password, saltedByte);

            if (String.Compare(user.PasswordHash, passwordSubmitted) == 0)
            {
                var secToken = await _jwtHandler.GetTokenAsync(user);
                var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);

                return Ok(new LoginResult()
                {
                    Success = true,
                    Token = jwt,
                });
            }

            return Unauthorized(new LoginResult()
            {
                Success = false,
            });
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        public bool UserNameExists(string username)
        {
            return (_context.Users?.Any(e => e.UserName == username)).GetValueOrDefault();
        }
    }
}