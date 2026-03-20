using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class RoleService
{
    private readonly IRoleRepository _repository;

    public RoleService(IRoleRepository repository) => _repository = repository;

    public async Task<IReadOnlyList<RoleDto>> GetAllAsync()
    {
        var roles = await _repository.GetAllAsync();
        return roles.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<RoleDto>> GetByEnvironmentIdAsync(Guid environmentId)
    {
        var roles = await _repository.GetByEnvironmentIdAsync(environmentId);
        return roles.Select(MapToDto).ToList();
    }

    public async Task<RoleDto?> GetByIdAsync(Guid id)
    {
        var role = await _repository.GetByIdAsync(id);
        return role != null ? MapToDto(role) : null;
    }

    public async Task<RoleDto> CreateAsync(RoleCreateDto dto)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            EnvironmentId = dto.EnvironmentId
        };
        var created = await _repository.CreateAsync(role);
        return MapToDto(created);
    }

    public async Task<RoleDto?> UpdateAsync(Guid id, RoleUpdateDto dto)
    {
        var role = await _repository.GetByIdAsync(id);
        if (role == null) return null;
        if (dto.Name != null) role.Name = dto.Name;
        if (dto.Description != null) role.Description = dto.Description;
        var updated = await _repository.UpdateAsync(role);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var role = await _repository.GetByIdAsync(id);
        if (role == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    internal static RoleDto MapToDto(Role r) => new(r.Id, r.Name, r.Description, r.EnvironmentId);
}
