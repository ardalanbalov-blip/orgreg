using System.Collections.Concurrent;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class InMemoryRoleRepository : IRoleRepository
{
    private static readonly ConcurrentDictionary<Guid, Role> _roles = new();

    static InMemoryRoleRepository()
    {
        var adminEnvId = InMemoryEnvironmentRepository.AdminEnvId;
        var dsEnvId = InMemoryEnvironmentRepository.DigitalaSamlingenEnvId;
        var spsmEnvId = InMemoryEnvironmentRepository.SpsmKontoEnvId;

        Seed("Handläggare", "Handlägger ärenden inom organisationen", adminEnvId);
        Seed("Administratör", "Administrerar organisationsdata", adminEnvId);
        Seed("Kontaktperson", "Kontaktperson för organisationen", adminEnvId);
        Seed("Läsare", "Har läsrättigheter i Digitala Samlingen", dsEnvId);
        Seed("Beställare", "Kan beställa läromedel", dsEnvId);
        Seed("Kontoägare", "Äger SPSM-kontot", spsmEnvId);
        Seed("Rektor", "Rektor för en skolenhet", adminEnvId);
        Seed("Lärare", "Lärare i en skolenhet", adminEnvId);
    }

    private static void Seed(string name, string desc, Guid envId)
    {
        var id = Guid.NewGuid();
        _roles[id] = new Role { Id = id, Name = name, Description = desc, EnvironmentId = envId };
    }

    public Task<Role?> GetByIdAsync(Guid id)
        => Task.FromResult(_roles.TryGetValue(id, out var r) ? r : null);

    public Task<IReadOnlyList<Role>> GetAllAsync()
        => Task.FromResult<IReadOnlyList<Role>>(_roles.Values.OrderBy(r => r.Name).ToList());

    public Task<IReadOnlyList<Role>> GetByEnvironmentIdAsync(Guid environmentId)
        => Task.FromResult<IReadOnlyList<Role>>(_roles.Values.Where(r => r.EnvironmentId == environmentId).OrderBy(r => r.Name).ToList());

    public Task<Role> CreateAsync(Role role) { _roles[role.Id] = role; return Task.FromResult(role); }
    public Task<Role> UpdateAsync(Role role) { _roles[role.Id] = role; return Task.FromResult(role); }
    public Task DeleteAsync(Guid id) { _roles.TryRemove(id, out _); return Task.CompletedTask; }
}
