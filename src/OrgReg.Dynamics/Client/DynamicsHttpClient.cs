using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using OrgReg.Dynamics.Models;

namespace OrgReg.Dynamics.Client;

public class DynamicsHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly DynamicsClientOptions _options;
    private readonly IConfidentialClientApplication? _msalClient;
    private readonly ILogger<DynamicsHttpClient> _logger;
    private readonly bool _isFake;

    public DynamicsHttpClient(
        HttpClient httpClient,
        IOptions<DynamicsClientOptions> options,
        ILogger<DynamicsHttpClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        _isFake = _options.ClientId == "fake" || string.IsNullOrEmpty(_options.ClientId);

        if (!_isFake)
        {
            _msalClient = ConfidentialClientApplicationBuilder
                .Create(_options.ClientId)
                .WithClientSecret(_options.ClientSecret)
                .WithAuthority($"https://login.microsoftonline.com/{_options.TenantId}")
                .Build();
        }

        if (!string.IsNullOrEmpty(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri($"{_options.BaseUrl}/api/data/{_options.ApiVersion}/");
        }
    }

    private async Task EnsureAuthenticatedAsync()
    {
        if (_isFake) return;

        var scopes = new[] { $"{_options.Resource}/.default" };
        var result = await _msalClient!.AcquireTokenForClient(scopes).ExecuteAsync();
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", result.AccessToken);
    }

    public async Task<DynamicsODataResponse<T>> GetAsync<T>(string entitySet, string? filter = null, string? select = null, int? top = null, int? skip = null, bool count = false)
    {
        await EnsureAuthenticatedAsync();

        var queryParts = new List<string>();
        if (!string.IsNullOrEmpty(filter)) queryParts.Add($"$filter={filter}");
        if (!string.IsNullOrEmpty(select)) queryParts.Add($"$select={select}");
        if (top.HasValue) queryParts.Add($"$top={top}");
        if (skip.HasValue) queryParts.Add($"$skip={skip}");
        if (count) queryParts.Add("$count=true");

        var query = queryParts.Count > 0 ? "?" + string.Join("&", queryParts) : "";
        var url = $"{entitySet}{query}";

        _logger.LogDebug("Dynamics GET: {Url}", url);

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<DynamicsODataResponse<T>>()
            ?? new DynamicsODataResponse<T>();
    }

    public async Task<T?> GetByIdAsync<T>(string entitySet, Guid id, string? select = null)
    {
        await EnsureAuthenticatedAsync();

        var query = !string.IsNullOrEmpty(select) ? $"?$select={select}" : "";
        var url = $"{entitySet}({id}){query}";

        var response = await _httpClient.GetAsync(url);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return default;

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }

    public async Task<Guid> CreateAsync<T>(string entitySet, T entity)
    {
        await EnsureAuthenticatedAsync();

        var response = await _httpClient.PostAsJsonAsync(entitySet, entity);
        response.EnsureSuccessStatusCode();

        var entityId = response.Headers.GetValues("OData-EntityId").FirstOrDefault();
        if (entityId != null)
        {
            var idStr = entityId.Split('(').Last().TrimEnd(')');
            return Guid.Parse(idStr);
        }

        throw new InvalidOperationException("Could not extract entity ID from Dynamics response");
    }

    public async Task UpdateAsync<T>(string entitySet, Guid id, T entity)
    {
        await EnsureAuthenticatedAsync();

        var request = new HttpRequestMessage(HttpMethod.Patch, $"{entitySet}({id})")
        {
            Content = JsonContent.Create(entity)
        };

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    public async Task DeleteAsync(string entitySet, Guid id)
    {
        await EnsureAuthenticatedAsync();

        var response = await _httpClient.DeleteAsync($"{entitySet}({id})");
        response.EnsureSuccessStatusCode();
    }
}
