using System.Collections.Concurrent;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class InMemoryUserRepository : IUserRepository
{
    private static readonly ConcurrentDictionary<Guid, User> _users = new();

    static InMemoryUserRepository()
    {
        Seed("Anna", "Andersson", "anna.andersson@stockholm.se", "SPSM-001");
        Seed("Erik", "Eriksson", "erik.eriksson@goteborg.se", "SPSM-002");
        Seed("Maria", "Johansson", "maria.johansson@malmo.se", "SPSM-003");
        Seed("Karl", "Svensson", "karl.svensson@spsm.se", "SPSM-004");
        Seed("Sofia", "Larsson", "sofia.larsson@skolverket.se", "SPSM-005");
    }

    private static void Seed(string first, string last, string email, string accountId)
    {
        var id = Guid.NewGuid();
        _users[id] = new User
        {
            Id = id,
            FirstName = first,
            LastName = last,
            Email = email,
            SpsmAccountId = accountId,
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 365)),
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Task<User?> GetByIdAsync(Guid id)
        => Task.FromResult(_users.TryGetValue(id, out var user) ? user : null);

    public Task<IReadOnlyList<User>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        var result = _users.Values
            .OrderBy(u => u.LastName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
        return Task.FromResult<IReadOnlyList<User>>(result);
    }

    public Task<User> CreateAsync(User user)
    {
        _users[user.Id] = user;
        return Task.FromResult(user);
    }

    public Task<User> UpdateAsync(User user)
    {
        _users[user.Id] = user;
        return Task.FromResult(user);
    }

    public Task DeleteAsync(Guid id)
    {
        _users.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
