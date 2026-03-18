using Microsoft.Extensions.Logging;
using OrgReg.Dynamics.Client;
using OrgReg.Dynamics.Models;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class DynamicsUnitRepository : IUnitRepository
{
    private const string EntitySet = "spsm_units";
    private readonly DynamicsHttpClient _client;
    private readonly ILogger<DynamicsUnitRepository> _logger;

    public DynamicsUnitRepository(DynamicsHttpClient client, ILogger<DynamicsUnitRepository> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<Unit?> GetByIdAsync(Guid id)
    {
        var dyn = await _client.GetByIdAsync<DynamicsUnit>(EntitySet, id);
        return dyn != null ? MapToDomain(dyn) : null;
    }

    public async Task<IReadOnlyList<Unit>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var filter = $"_spsm_organisationid_value eq '{organisationId}'";
        var response = await _client.GetAsync<DynamicsUnit>(EntitySet, filter: filter);
        return response.Value.Select(MapToDomain).ToList();
    }

    public async Task<Unit> CreateAsync(Unit unit)
    {
        var dyn = MapToDynamics(unit);
        var id = await _client.CreateAsync(EntitySet, dyn);
        unit.Id = id;
        return unit;
    }

    public async Task<Unit> UpdateAsync(Unit unit)
    {
        var dyn = MapToDynamics(unit);
        await _client.UpdateAsync(EntitySet, unit.Id, dyn);
        unit.UpdatedAt = DateTime.UtcNow;
        return unit;
    }

    public async Task DeleteAsync(Guid id)
    {
        await _client.DeleteAsync(EntitySet, id);
        _logger.LogInformation("Deleted unit {Id} from Dynamics", id);
    }

    private static Unit MapToDomain(DynamicsUnit dyn) => new()
    {
        Id = dyn.UnitId,
        Name = dyn.Name,
        OrganisationId = dyn.OrganisationId ?? Guid.Empty,
        UnitTypeId = dyn.UnitTypeId ?? Guid.Empty
    };

    private static DynamicsUnit MapToDynamics(Unit unit) => new()
    {
        UnitId = unit.Id,
        Name = unit.Name,
        OrganisationId = unit.OrganisationId,
        UnitTypeId = unit.UnitTypeId
    };
}
