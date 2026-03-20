using OrgReg.Shared.DTOs;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<UserDto>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        var users = await _repository.GetAllAsync(page, pageSize);
        return new PagedResult<UserDto>(
            users.Select(MapToDto).ToList(),
            users.Count, page, pageSize
        );
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _repository.GetByIdAsync(id);
        return user != null ? MapToDto(user) : null;
    }

    public async Task<UserDto> CreateAsync(UserCreateDto dto)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            SpsmAccountId = dto.SpsmAccountId
        };

        var created = await _repository.CreateAsync(user);
        return MapToDto(created);
    }

    public async Task<UserDto?> UpdateAsync(Guid id, UserUpdateDto dto)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return null;

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.SpsmAccountId != null) user.SpsmAccountId = dto.SpsmAccountId;
        user.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(user);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    internal static UserDto MapToDto(User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email,
        user.SpsmAccountId,
        user.CreatedAt,
        user.UpdatedAt
    );
}
