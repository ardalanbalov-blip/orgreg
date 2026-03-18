using System.Collections.Concurrent;
using System.Text.Json.Serialization;

namespace OrgReg.FakeDynamics.Store;

public static class InMemoryStore
{
    public static ConcurrentDictionary<Guid, DynAccount> Accounts { get; } = new();
    public static ConcurrentDictionary<Guid, DynUnit> Units { get; } = new();
    public static ConcurrentDictionary<Guid, DynOrgType> OrgTypes { get; } = new();

    static InMemoryStore()
    {
        // Seed organisation types
        var kommun = new DynOrgType { Id = Guid.Parse("c1000000-0000-0000-0000-000000000001"), Name = "Kommun" };
        var friskola = new DynOrgType { Id = Guid.Parse("c1000000-0000-0000-0000-000000000002"), Name = "Fristående huvudman" };
        var statlig = new DynOrgType { Id = Guid.Parse("c1000000-0000-0000-0000-000000000003"), Name = "Statlig" };
        var ovrig = new DynOrgType { Id = Guid.Parse("c1000000-0000-0000-0000-000000000004"), Name = "Övrig" };
        OrgTypes[kommun.Id] = kommun;
        OrgTypes[friskola.Id] = friskola;
        OrgTypes[statlig.Id] = statlig;
        OrgTypes[ovrig.Id] = ovrig;

        // Seed demo organisations
        SeedAccount("Stockholms kommun", "212000-0142", kommun.Id, "Hantverkargatan 1", "10535", "Stockholm", "info@stockholm.se", "08-508 00 000");
        SeedAccount("Göteborgs kommun", "212000-1355", kommun.Id, "Gustaf Adolfs Torg 1", "40483", "Göteborg", "info@goteborg.se", "031-365 00 00");
        SeedAccount("Malmö kommun", "212000-1124", kommun.Id, "August Palms Plats 1", "20580", "Malmö", "info@malmo.se", "040-34 10 00");
        SeedAccount("Kunskapsskolan AB", "556583-3614", friskola.Id, "Drottninggatan 18", "11151", "Stockholm", "info@kunskapsskolan.se", "08-660 32 00");
        SeedAccount("Internationella Engelska Skolan", "556462-4368", friskola.Id, "Nybrogatan 6", "11434", "Stockholm", "info@engelska.se", "08-545 128 00");
        SeedAccount("Specialpedagogiska skolmyndigheten", "202100-5745", statlig.Id, "Rälsvägen 8", "12234", "Hägersten", "spsm@spsm.se", "010-473 50 00");
        SeedAccount("Skolverket", "202100-4185", statlig.Id, "Fleminggatan 14", "10620", "Stockholm", "skolverket@skolverket.se", "08-527 332 00");
        SeedAccount("Uppsala kommun", "212000-3005", kommun.Id, "Stationsgatan 12", "75374", "Uppsala", "info@uppsala.se", "018-727 00 00");

        // Seed some units
        var sthlmId = Accounts.Values.First(a => a.Name == "Stockholms kommun").AccountId;
        SeedUnit("Södra Latins gymnasium", sthlmId, "Gymnasieskola");
        SeedUnit("Eriksdalsskolan", sthlmId, "Grundskola");
        SeedUnit("Blackebergs gymnasium", sthlmId, "Gymnasieskola");

        var gbgId = Accounts.Values.First(a => a.Name == "Göteborgs kommun").AccountId;
        SeedUnit("Hvitfeldtska gymnasiet", gbgId, "Gymnasieskola");
        SeedUnit("Katrinelundsskolan", gbgId, "Grundskola");
    }

    private static void SeedAccount(string name, string orgNr, Guid typeId, string street, string postal, string city, string email, string phone)
    {
        var id = Guid.NewGuid();
        Accounts[id] = new DynAccount
        {
            AccountId = id,
            Name = name,
            OrgNumber = orgNr,
            StateCode = 0,
            StatusCode = 1,
            SourceType = 0,
            OrganisationTypeId = typeId,
            OrganisationTypeName = OrgTypes[typeId].Name,
            PostalStreet = street,
            PostalCode = postal,
            PostalCity = city,
            PostalCountry = "Sverige",
            Email = email,
            Phone = phone,
            CreatedOn = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 365)),
            ModifiedOn = DateTime.UtcNow,
        };
    }

    private static void SeedUnit(string name, Guid orgId, string unitType)
    {
        var id = Guid.NewGuid();
        Units[id] = new DynUnit
        {
            UnitId = id,
            Name = name,
            StateCode = 0,
            OrganisationId = orgId,
            UnitTypeName = unitType,
        };
    }
}

public class DynAccount
{
    [JsonPropertyName("accountid")] public Guid AccountId { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("spsm_orgnumber")] public string? OrgNumber { get; set; }
    [JsonPropertyName("statecode")] public int StateCode { get; set; }
    [JsonPropertyName("statuscode")] public int StatusCode { get; set; }
    [JsonPropertyName("spsm_sourcetype")] public int? SourceType { get; set; }
    [JsonPropertyName("spsm_organisationtypeid")] public Guid? OrganisationTypeId { get; set; }
    [JsonPropertyName("spsm_organisationtypename")] public string? OrganisationTypeName { get; set; }
    [JsonPropertyName("address1_line1")] public string? PostalStreet { get; set; }
    [JsonPropertyName("address1_postalcode")] public string? PostalCode { get; set; }
    [JsonPropertyName("address1_city")] public string? PostalCity { get; set; }
    [JsonPropertyName("address1_country")] public string? PostalCountry { get; set; }
    [JsonPropertyName("address2_line1")] public string? VisitStreet { get; set; }
    [JsonPropertyName("address2_postalcode")] public string? VisitPostalCode { get; set; }
    [JsonPropertyName("address2_city")] public string? VisitCity { get; set; }
    [JsonPropertyName("emailaddress1")] public string? Email { get; set; }
    [JsonPropertyName("telephone1")] public string? Phone { get; set; }
    [JsonPropertyName("createdon")] public DateTime? CreatedOn { get; set; }
    [JsonPropertyName("modifiedon")] public DateTime? ModifiedOn { get; set; }
}

public class DynUnit
{
    [JsonPropertyName("spsm_unitid")] public Guid UnitId { get; set; }
    [JsonPropertyName("spsm_name")] public string Name { get; set; } = "";
    [JsonPropertyName("statecode")] public int StateCode { get; set; }
    [JsonPropertyName("spsm_organisationid")] public Guid? OrganisationId { get; set; }
    [JsonPropertyName("spsm_unittypename")] public string? UnitTypeName { get; set; }
}

public class DynOrgType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
}
