using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using OrgReg.Integrations.SS12000;
using OrgReg.Integrations.SS12000.Models;
using OrgReg.Shared.Interfaces;

namespace OrgReg.Integrations.Statistikdatabasen;

/// <summary>
/// Client for reading organisation data from Statistikdatabasen
/// and feeding it into SPSM's Organisation API via the information layer.
/// Replaces the previous direct integration to Dynamics database.
/// </summary>
public class StatistikdatabasenClient
{
    private readonly HttpClient _httpClient;
    private readonly IOrganisationRepository _organisationRepo;
    private readonly ILogger<StatistikdatabasenClient> _logger;

    public StatistikdatabasenClient(
        HttpClient httpClient,
        IOrganisationRepository organisationRepo,
        ILogger<StatistikdatabasenClient> logger)
    {
        _httpClient = httpClient;
        _organisationRepo = organisationRepo;
        _logger = logger;
    }

    public async Task SyncOrganisationsAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting sync from Statistikdatabasen");

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
                    existing.Name = org.Name;
                    existing.OrgNumber = org.OrgNumber;
                    await _organisationRepo.UpdateAsync(existing);
                    totalSynced++;
                }
            }

            pageToken = response.PageToken;
        } while (pageToken != null);

        _logger.LogInformation("Statistikdatabasen sync complete. {Count} organisations synced", totalSynced);
    }
}
