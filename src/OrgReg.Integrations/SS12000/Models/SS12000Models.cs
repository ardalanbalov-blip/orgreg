using System.Text.Json.Serialization;

namespace OrgReg.Integrations.SS12000.Models;

/// <summary>
/// SS12000 Organisation according to the latest SS12000 standard.
/// Maps to the Swedish standard for school data exchange.
/// </summary>
public class SS12000Organisation
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("organisationCode")]
    public string? OrganisationCode { get; set; }

    [JsonPropertyName("organisationType")]
    public string? OrganisationType { get; set; }

    [JsonPropertyName("parentOrganisation")]
    public SS12000Reference? ParentOrganisation { get; set; }
}

public class SS12000SchoolUnit
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("schoolUnitCode")]
    public string? SchoolUnitCode { get; set; }

    [JsonPropertyName("schoolTypes")]
    public List<SS12000SchoolType>? SchoolTypes { get; set; }

    [JsonPropertyName("organisation")]
    public SS12000Reference? Organisation { get; set; }

    [JsonPropertyName("municipalityCode")]
    public string? MunicipalityCode { get; set; }
}

public class SS12000SchoolType
{
    [JsonPropertyName("schoolType")]
    public string SchoolType { get; set; } = string.Empty;
}

public class SS12000Person
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("givenName")]
    public string? GivenName { get; set; }

    [JsonPropertyName("familyName")]
    public string? FamilyName { get; set; }

    [JsonPropertyName("emails")]
    public List<SS12000Email>? Emails { get; set; }

    [JsonPropertyName("civicNo")]
    public SS12000CivicNo? CivicNo { get; set; }
}

public class SS12000Email
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string? Type { get; set; }
}

public class SS12000CivicNo
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("nationality")]
    public string? Nationality { get; set; }
}

public class SS12000Reference
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }
}

public class SS12000PagedResponse<T>
{
    [JsonPropertyName("data")]
    public List<T> Data { get; set; } = new();

    [JsonPropertyName("pageToken")]
    public string? PageToken { get; set; }

    [JsonPropertyName("totalRecords")]
    public int? TotalRecords { get; set; }
}
