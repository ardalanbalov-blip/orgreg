using System.Collections.Concurrent;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class InMemoryGroupRepository : IGroupRepository
{
    private static readonly ConcurrentDictionary<Guid, Group> _groups = new();

    public Task<Group?> GetByIdAsync(Guid id)
        => Task.FromResult(_groups.TryGetValue(id, out var group) ? group : null);

    public Task<IReadOnlyList<Group>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var result = _groups.Values
            .Where(g => g.OrganisationId == organisationId)
            .OrderBy(g => g.Name)
            .ToList();
        return Task.FromResult<IReadOnlyList<Group>>(result);
    }

    public Task<IReadOnlyList<Group>> GetByUnitIdAsync(Guid unitId)
    {
        var result = _groups.Values
            .Where(g => g.UnitId == unitId)
            .OrderBy(g => g.Name)
            .ToList();
        return Task.FromResult<IReadOnlyList<Group>>(result);
    }

    public Task<Group> CreateAsync(Group group)
    {
        _groups[group.Id] = group;
        return Task.FromResult(group);
    }

    public Task<Group> UpdateAsync(Group group)
    {
        _groups[group.Id] = group;
        return Task.FromResult(group);
    }

    public Task DeleteAsync(Guid id)
    {
        _groups.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
