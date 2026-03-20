using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class GroupService
{
    private readonly IGroupRepository _repository;

    public GroupService(IGroupRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<GroupDto>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var groups = await _repository.GetByOrganisationIdAsync(organisationId);
        return groups.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<GroupDto>> GetByUnitIdAsync(Guid unitId)
    {
        var groups = await _repository.GetByUnitIdAsync(unitId);
        return groups.Select(MapToDto).ToList();
    }

    public async Task<GroupDto?> GetByIdAsync(Guid id)
    {
        var group = await _repository.GetByIdAsync(id);
        return group != null ? MapToDto(group) : null;
    }

    public async Task<GroupDto> CreateAsync(GroupCreateDto dto)
    {
        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            OrganisationId = dto.OrganisationId,
            UnitId = dto.UnitId
        };

        var created = await _repository.CreateAsync(group);
        return MapToDto(created);
    }

    public async Task<GroupDto?> UpdateAsync(Guid id, GroupUpdateDto dto)
    {
        var group = await _repository.GetByIdAsync(id);
        if (group == null) return null;

        if (dto.Name != null) group.Name = dto.Name;
        if (dto.Description != null) group.Description = dto.Description;
        group.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(group);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var group = await _repository.GetByIdAsync(id);
        if (group == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static GroupDto MapToDto(Group group) => new(
        group.Id,
        group.Name,
        group.Description,
        group.OrganisationId,
        group.UnitId,
        group.Roles.Select(r => new RoleDto(r.Id, r.Name, r.Description, r.EnvironmentId)).ToList(),
        group.CreatedAt,
        group.UpdatedAt
    );
}
