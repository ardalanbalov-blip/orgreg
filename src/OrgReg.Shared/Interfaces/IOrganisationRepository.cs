using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Shared.Interfaces;

public interface IOrganisationRepository
{
    Task<Organisation?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Organisation>> GetAllAsync(int page = 1, int pageSize = 50);
    Task<IReadOnlyList<Organisation>> SearchAsync(string query, int page = 1, int pageSize = 50);
    Task<Organisation> CreateAsync(Organisation organisation);
    Task<Organisation> UpdateAsync(Organisation organisation);
    Task DeleteAsync(Guid id);
    Task<int> CountAsync();
}

public interface IUnitRepository
{
    Task<Unit?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Unit>> GetByOrganisationIdAsync(Guid organisationId);
    Task<Unit> CreateAsync(Unit unit);
    Task<Unit> UpdateAsync(Unit unit);
    Task DeleteAsync(Guid id);
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<User>> GetAllAsync(int page = 1, int pageSize = 50);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(Guid id);
}

public interface IGroupRepository
{
    Task<Group?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Group>> GetByOrganisationIdAsync(Guid organisationId);
    Task<IReadOnlyList<Group>> GetByUnitIdAsync(Guid unitId);
    Task<Group> CreateAsync(Group group);
    Task<Group> UpdateAsync(Group group);
    Task DeleteAsync(Guid id);
}
