namespace OrgReg.Dynamics.Client;

public class DynamicsClientOptions
{
    public const string SectionName = "Dynamics";

    public string BaseUrl { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "v9.2";
}
