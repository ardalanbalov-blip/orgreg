using System.Collections.Concurrent;
using OrgReg.Shared.Interfaces;

namespace OrgReg.Dynamics.Repositories;

public class InMemoryEnvironmentRepository : IEnvironmentRepository
{
    public static readonly Guid AdminEnvId = Guid.Parse("e0000000-0000-0000-0000-000000000001");
    public static readonly Guid DigitalaSamlingenEnvId = Guid.Parse("e0000000-0000-0000-0000-000000000002");
    public static readonly Guid SpsmKontoEnvId = Guid.Parse("e0000000-0000-0000-0000-000000000003");

    private static readonly ConcurrentDictionary<Guid, Shared.Models.Organisation.Environment> _envs = new();

    static InMemoryEnvironmentRepository()
    {
        _envs[AdminEnvId] = new Shared.Models.Organisation.Environment
        {
            Id = AdminEnvId,
            Name = "Organisationsregister",
            Description = "SPSM:s interna administrationssystem för organisationer"
        };
        _envs[DigitalaSamlingenEnvId] = new Shared.Models.Organisation.Environment
        {
            Id = DigitalaSamlingenEnvId,
            Name = "Digitala Samlingen",
            Description = "Digitala Samlingens tjänsteplattform"
        };
        _envs[SpsmKontoEnvId] = new Shared.Models.Organisation.Environment
        {
            Id = SpsmKontoEnvId,
            Name = "SPSM Konto",
            Description = "SPSM:s kontosystem för externa användare"
        };
    }

    public Task<Shared.Models.Organisation.Environment?> GetByIdAsync(Guid id)
        => Task.FromResult(_envs.TryGetValue(id, out var e) ? e : null);

    public Task<IReadOnlyList<Shared.Models.Organisation.Environment>> GetAllAsync()
        => Task.FromResult<IReadOnlyList<Shared.Models.Organisation.Environment>>(_envs.Values.OrderBy(e => e.Name).ToList());

    public Task<Shared.Models.Organisation.Environment> CreateAsync(Shared.Models.Organisation.Environment env)
    {
        _envs[env.Id] = env;
        return Task.FromResult(env);
    }

    public Task<Shared.Models.Organisation.Environment> UpdateAsync(Shared.Models.Organisation.Environment env)
    {
        _envs[env.Id] = env;
        return Task.FromResult(env);
    }

    public Task DeleteAsync(Guid id) { _envs.TryRemove(id, out _); return Task.CompletedTask; }
}
