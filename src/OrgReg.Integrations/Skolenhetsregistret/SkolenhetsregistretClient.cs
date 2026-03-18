using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using OrgReg.Integrations.SS12000;
using OrgReg.Integrations.SS12000.Models;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Integrations.Skolenhetsregistret;

/// <summary>
/// Client for reading organisation and school unit data from Skolenhetsregistret (Skolverket)
/// and writing it into SPSM's Organisation API via the information layer.
/// Replaces the previous direct integration to Dynamics database.
/// </summary>
public class SkolenhetsregistretClient
{
    private readonly HttpClient _httpClient;
    private readonly IOrganisationRepository _organisationRepo;
    private readonly IUnitRepository _unitRepo;
    private readonly ILogger<SkolenhetsregistretClient> _logger;

    public SkolenhetsregistretClient(
        HttpClient httpClient,
        IOrganisationRepository organisationRepo,
        IUnitRepository unitRepo,
        ILogger<SkolenhetsregistretClient> logger)
    {
        _httpClient = httpClient;
        _organisationRepo = organisationRepo;
        _unitRepo = unitRepo;
        _logger = logger;
    }

    public async Task SyncOrganisationsAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting sync from Skolenhetsregistret");

        string? pageToken = null;
        var totalSynced = 0;

        do
        {
            var url = "v1/organisations" + (pageToken != null ? $"?pageToken={pageToken}" : "");
            var response = await _httpClient.GetFromJsonAsync<SS12000PagedResponse<SS12000Organisation>>(url, ct);

            if (response?.Data == null) break;

            foreach (var ssOrg in response.Data)
            {
                var org = SS12000Transformer.ToOrganisation(ssOrg);
                var existing = await _organisationRepo.GetByIdAsync(org.Id);

                if (existing == null)
                {
                    await _organisationRepo.CreateAsync(org);
                    totalSynced++;
                }
                else if (existing.Status != Shared.Enums.OrganisationStatus.Active)
                {
                    // Only update passive organisations — active ones are protected
                    existing.Name = org.Name;
                    existing.OrgNumber = org.OrgNumber;
                    await _organisationRepo.UpdateAsync(existing);
                    totalSynced++;
                }
            }

            pageToken = response.PageToken;
        } while (pageToken != null);

        _logger.LogInformation("Skolenhetsregistret sync complete. {Count} organisations synced", totalSynced);
    }

    public async Task SyncSchoolUnitsAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting school unit sync from Skolenhetsregistret");

        string? pageToken = null;
        var totalSynced = 0;

        do
        {
            var url = "v1/schoolUnits" + (pageToken != null ? $"?pageToken={pageToken}" : "");
            var response = await _httpClient.GetFromJsonAsync<SS12000PagedResponse<SS12000SchoolUnit>>(url, ct);

            if (response?.Data == null) break;

            foreach (var ssUnit in response.Data)
            {
                var orgId = Guid.TryParse(ssUnit.Organisation?.Id, out var oid) ? oid : Guid.Empty;
                if (orgId == Guid.Empty) continue;

                var unit = SS12000Transformer.ToUnit(ssUnit, orgId);
                var existing = await _unitRepo.GetByIdAsync(unit.Id);

                if (existing == null)
                {
                    await _unitRepo.CreateAsync(unit);
                    totalSynced++;
                }
                else
                {
                    existing.Name = unit.Name;
                    await _unitRepo.UpdateAsync(existing);
                    totalSynced++;
                }
            }

            pageToken = response.PageToken;
        } while (pageToken != null);

        _logger.LogInformation("School unit sync complete. {Count} units synced", totalSynced);
    }
}
