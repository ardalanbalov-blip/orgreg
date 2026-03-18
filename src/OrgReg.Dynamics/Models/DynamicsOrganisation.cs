using System.Text.Json.Serialization;

namespace OrgReg.Dynamics.Models;

public class DynamicsOrganisation
{
    [JsonPropertyName("accountid")]
    public Guid AccountId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("spsm_orgnumber")]
    public string? OrgNumber { get; set; }

    [JsonPropertyName("statecode")]
    public int StateCode { get; set; }

    [JsonPropertyName("statuscode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("spsm_sourcetype")]
    public int? SourceType { get; set; }

    [JsonPropertyName("spsm_organisationtypeid")]
    public Guid? OrganisationTypeId { get; set; }

    [JsonPropertyName("spsm_organisationtypename")]
    public string? OrganisationTypeName { get; set; }

    [JsonPropertyName("address1_line1")]
    public string? PostalStreet { get; set; }

    [JsonPropertyName("address1_postalcode")]
    public string? PostalCode { get; set; }

    [JsonPropertyName("address1_city")]
    public string? PostalCity { get; set; }

    [JsonPropertyName("address1_country")]
    public string? PostalCountry { get; set; }

    [JsonPropertyName("address2_line1")]
    public string? VisitStreet { get; set; }

    [JsonPropertyName("address2_postalcode")]
    public string? VisitPostalCode { get; set; }

    [JsonPropertyName("address2_city")]
    public string? VisitCity { get; set; }

    [JsonPropertyName("emailaddress1")]
    public string? Email { get; set; }

    [JsonPropertyName("telephone1")]
    public string? Phone { get; set; }

    [JsonPropertyName("createdon")]
    public DateTime? CreatedOn { get; set; }

    [JsonPropertyName("modifiedon")]
    public DateTime? ModifiedOn { get; set; }
}

public class DynamicsUnit
{
    [JsonPropertyName("spsm_unitid")]
    public Guid UnitId { get; set; }

    [JsonPropertyName("spsm_name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("statecode")]
    public int StateCode { get; set; }

    [JsonPropertyName("spsm_unittypeid")]
    public Guid? UnitTypeId { get; set; }

    [JsonPropertyName("spsm_organisationid")]
    public Guid? OrganisationId { get; set; }
}

public class DynamicsODataResponse<T>
{
    [JsonPropertyName("value")]
    public List<T> Value { get; set; } = new();

    [JsonPropertyName("@odata.count")]
    public int? Count { get; set; }

    [JsonPropertyName("@odata.nextLink")]
    public string? NextLink { get; set; }
}
