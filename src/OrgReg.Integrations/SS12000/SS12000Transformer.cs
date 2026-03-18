using OrgReg.Integrations.SS12000.Models;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Integrations.SS12000;

/// <summary>
/// Transforms SS12000 standard data to/from SPSM's internal Organisation domain model.
/// This transformer lives in the information layer as per the architecture document,
/// ensuring that consuming services don't need to understand SS12000 specifics.
/// </summary>
public static class SS12000Transformer
{
    public static Organisation ToOrganisation(SS12000Organisation ss)
    {
        return new Organisation
        {
            Id = Guid.TryParse(ss.Id, out var id) ? id : Guid.NewGuid(),
            Name = ss.DisplayName,
            OrgNumber = ss.OrganisationCode,
            Status = OrganisationStatus.Passive,
            SourceType = SourceType.External,
            OrganisationType = MapOrganisationType(ss.OrganisationType)
        };
    }

    public static Unit ToUnit(SS12000SchoolUnit ss, Guid organisationId)
    {
        var unit = new Unit
        {
            Id = Guid.TryParse(ss.Id, out var id) ? id : Guid.NewGuid(),
            Name = ss.DisplayName,
            Status = OrganisationStatus.Passive,
            SourceType = SourceType.External,
            OrganisationId = organisationId,
            EducationTypes = ss.SchoolTypes?.Select(st => new EducationType
            {
                Id = Guid.NewGuid(),
                Name = st.SchoolType,
                Code = st.SchoolType
            }).ToList() ?? new()
        };

        return unit;
    }

    public static User ToUser(SS12000Person ss)
    {
        return new User
        {
            Id = Guid.TryParse(ss.Id, out var id) ? id : Guid.NewGuid(),
            FirstName = ss.GivenName ?? string.Empty,
            LastName = ss.FamilyName ?? string.Empty,
            Email = ss.Emails?.FirstOrDefault()?.Value
        };
    }

    public static SS12000Organisation FromOrganisation(Organisation org)
    {
        return new SS12000Organisation
        {
            Id = org.Id.ToString(),
            DisplayName = org.Name,
            OrganisationCode = org.OrgNumber,
            OrganisationType = MapOrganisationTypeToSS12000(org.OrganisationType?.Name)
        };
    }

    public static SS12000SchoolUnit FromUnit(Unit unit)
    {
        return new SS12000SchoolUnit
        {
            Id = unit.Id.ToString(),
            DisplayName = unit.Name,
            SchoolUnitCode = unit.Id.ToString(),
            Organisation = new SS12000Reference { Id = unit.OrganisationId.ToString() },
            SchoolTypes = unit.EducationTypes.Select(e => new SS12000SchoolType
            {
                SchoolType = e.Code ?? e.Name
            }).ToList()
        };
    }

    private static OrganisationType MapOrganisationType(string? ssType) => ssType switch
    {
        "Kommun" => new OrganisationType { Id = Guid.NewGuid(), Name = "Kommun" },
        "Friskola" => new OrganisationType { Id = Guid.NewGuid(), Name = "Fristående huvudman" },
        "Stat" => new OrganisationType { Id = Guid.NewGuid(), Name = "Statlig" },
        _ => new OrganisationType { Id = Guid.NewGuid(), Name = ssType ?? "Okänd" }
    };

    private static string MapOrganisationTypeToSS12000(string? internalType) => internalType switch
    {
        "Kommun" => "Kommun",
        "Fristående huvudman" => "Friskola",
        "Statlig" => "Stat",
        _ => "Övrig"
    };
}
