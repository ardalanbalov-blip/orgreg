using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;

namespace OrgReg.Organisation.Api.Services;

public class EnvironmentService
{
    private readonly IEnvironmentRepository _repository;
    private readonly IRoleRepository _roleRepository;

    public EnvironmentService(IEnvironmentRepository repository, IRoleRepository roleRepository)
    {
        _repository = repository;
        _roleRepository = roleRepository;
    }

    public async Task<IReadOnlyList<EnvironmentDto>> GetAllAsync()
    {
        var envs = await _repository.GetAllAsync();
        var result = new List<EnvironmentDto>();
        foreach (var env in envs)
        {
            var roles = await _roleRepository.GetByEnvironmentIdAsync(env.Id);
            result.Add(new EnvironmentDto(env.Id, env.Name, env.Description,
                roles.Select(r => new RoleDto(r.Id, r.Name, r.Description, r.EnvironmentId)).ToList()));
        }
        return result;
    }

    public async Task<EnvironmentDto?> GetByIdAsync(Guid id)
    {
        var env = await _repository.GetByIdAsync(id);
        if (env == null) return null;
        var roles = await _roleRepository.GetByEnvironmentIdAsync(env.Id);
        return new EnvironmentDto(env.Id, env.Name, env.Description,
            roles.Select(r => new RoleDto(r.Id, r.Name, r.Description, r.EnvironmentId)).ToList());
    }

    public async Task<EnvironmentDto> CreateAsync(EnvironmentCreateDto dto)
    {
        var env = new Shared.Models.Organisation.Environment
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description
        };
        var created = await _repository.CreateAsync(env);
        return new EnvironmentDto(created.Id, created.Name, created.Description, new List<RoleDto>());
    }

    public async Task<EnvironmentDto?> UpdateAsync(Guid id, EnvironmentUpdateDto dto)
    {
        var env = await _repository.GetByIdAsync(id);
        if (env == null) return null;
        if (dto.Name != null) env.Name = dto.Name;
        if (dto.Description != null) env.Description = dto.Description;
        var updated = await _repository.UpdateAsync(env);
        var roles = await _roleRepository.GetByEnvironmentIdAsync(updated.Id);
        return new EnvironmentDto(updated.Id, updated.Name, updated.Description,
            roles.Select(r => new RoleDto(r.Id, r.Name, r.Description, r.EnvironmentId)).ToList());
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var env = await _repository.GetByIdAsync(id);
        if (env == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }
}
