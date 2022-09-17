using Backend.Models;
using Backend.Requests;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using System.Numerics;

namespace Backend.Validators
{
    public class RegisterRequestValidator : AbstractValidator<LoginRegisterRequest>
    {
        private readonly IEnumerable<User> _users;
        public RegisterRequestValidator(IEnumerable<User> users)
        {
            _users = users;
            RuleFor(user => user.UserName).NotNull();
            RuleFor(user => user.UserName).Must(IsUserNameUnique).WithMessage("User already exists.");
        }

        private bool IsUserNameUnique(LoginRegisterRequest searchedUser, string username)
        {
            return _users.All(user =>
                user.Equals(searchedUser) || user.UserName != username);
        }
    }
}
