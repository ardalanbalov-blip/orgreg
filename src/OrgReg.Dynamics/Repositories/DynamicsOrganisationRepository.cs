using Microsoft.Extensions.Logging;
using OrgReg.Dynamics.Client;
using OrgReg.Dynamics.Mapping;
using OrgReg.Dynamics.Models;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class DynamicsOrganisationRepository : IOrganisationRepository
{
    private const string EntitySet = "accounts";
    private readonly DynamicsHttpClient _client;
    private readonly ILogger<DynamicsOrganisationRepository> _logger;

    public DynamicsOrganisationRepository(DynamicsHttpClient client, ILogger<DynamicsOrganisationRepository> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<Organisation?> GetByIdAsync(Guid id)
    {
        var dyn = await _client.GetByIdAsync<DynamicsOrganisation>(EntitySet, id);
        return dyn != null ? OrganisationMapper.ToDomain(dyn) : null;
    }

    public async Task<IReadOnlyList<Organisation>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        var skip = (page - 1) * pageSize;
        var response = await _client.GetAsync<DynamicsOrganisation>(EntitySet, top: pageSize, skip: skip, count: true);
        return response.Value.Select(OrganisationMapper.ToDomain).ToList();
    }

    public async Task<IReadOnlyList<Organisation>> SearchAsync(string query, int page = 1, int pageSize = 50)
    {
        var skip = (page - 1) * pageSize;
        var filter = $"contains(name,'{query}') or contains(spsm_orgnumber,'{query}')";
        var response = await _client.GetAsync<DynamicsOrganisation>(EntitySet, filter: filter, top: pageSize, skip: skip, count: true);
        return response.Value.Select(OrganisationMapper.ToDomain).ToList();
    }

    public async Task<Organisation> CreateAsync(Organisation organisation)
    {
        var dyn = OrganisationMapper.ToDynamics(organisation);
        var id = await _client.CreateAsync(EntitySet, dyn);
        organisation.Id = id;
        _logger.LogInformation("Created organisation {Id} in Dynamics", id);
        return organisation;
    }

    public async Task<Organisation> UpdateAsync(Organisation organisation)
    {
        // Protect active organisations from external overwrites
        if (organisation.SourceType == Shared.Enums.SourceType.External
            && organisation.Status == Shared.Enums.OrganisationStatus.Active)
        {
            _logger.LogWarning("Attempt to overwrite active organisation {Id} from external source blocked", organisation.Id);
            throw new InvalidOperationException("Active organisations cannot be overwritten by external sources.");
        }

        var dyn = OrganisationMapper.ToDynamics(organisation);
        await _client.UpdateAsync(EntitySet, organisation.Id, dyn);
        organisation.UpdatedAt = DateTime.UtcNow;
        _logger.LogInformation("Updated organisation {Id} in Dynamics", organisation.Id);
        return organisation;
    }

    public async Task DeleteAsync(Guid id)
    {
        await _client.DeleteAsync(EntitySet, id);
        _logger.LogInformation("Deleted organisation {Id} from Dynamics", id);
    }

    public async Task<int> CountAsync()
    {
        var response = await _client.GetAsync<DynamicsOrganisation>(EntitySet, top: 0, count: true);
        return response.Count ?? 0;
    }
}
