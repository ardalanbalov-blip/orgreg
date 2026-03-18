using OrgReg.Dynamics.Models;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Mapping;

public static class OrganisationMapper
{
    public static Organisation ToDomain(DynamicsOrganisation dyn)
    {
        var org = new Organisation
        {
            Id = dyn.AccountId,
            Name = dyn.Name,
            OrgNumber = dyn.OrgNumber,
            Status = MapStatus(dyn.StateCode, dyn.StatusCode),
            SourceType = MapSourceType(dyn.SourceType),
            OrganisationTypeId = dyn.OrganisationTypeId ?? Guid.Empty,
            CreatedAt = dyn.CreatedOn ?? DateTime.UtcNow,
            UpdatedAt = dyn.ModifiedOn ?? DateTime.UtcNow,
            Addresses = new List<AddressDetails>(),
            Contacts = new List<ContactDetails>()
        };

        if (dyn.OrganisationTypeId.HasValue)
        {
            org.OrganisationType = new OrganisationType
            {
                Id = dyn.OrganisationTypeId.Value,
                Name = dyn.OrganisationTypeName ?? string.Empty
            };
        }

        if (!string.IsNullOrEmpty(dyn.PostalStreet))
        {
            org.Addresses.Add(new AddressDetails
            {
                Id = Guid.NewGuid(),
                AddressType = "Postal",
                Street = dyn.PostalStreet,
                PostalCode = dyn.PostalCode,
                City = dyn.PostalCity,
                Country = dyn.PostalCountry,
                OrganisationId = org.Id
            });
        }

        if (!string.IsNullOrEmpty(dyn.VisitStreet))
        {
            org.Addresses.Add(new AddressDetails
            {
                Id = Guid.NewGuid(),
                AddressType = "Visit",
                Street = dyn.VisitStreet,
                PostalCode = dyn.VisitPostalCode,
                City = dyn.VisitCity,
                OrganisationId = org.Id
            });
        }

        if (!string.IsNullOrEmpty(dyn.Email))
        {
            org.Contacts.Add(new ContactDetails
            {
                Id = Guid.NewGuid(),
                ContactType = "Email",
                Value = dyn.Email,
                OrganisationId = org.Id
            });
        }

        if (!string.IsNullOrEmpty(dyn.Phone))
        {
            org.Contacts.Add(new ContactDetails
            {
                Id = Guid.NewGuid(),
                ContactType = "Phone",
                Value = dyn.Phone,
                OrganisationId = org.Id
            });
        }

        return org;
    }

    public static DynamicsOrganisation ToDynamics(Organisation org)
    {
        var dyn = new DynamicsOrganisation
        {
            AccountId = org.Id,
            Name = org.Name,
            OrgNumber = org.OrgNumber,
            StateCode = MapStateCode(org.Status),
            StatusCode = MapStatusCode(org.Status),
            SourceType = MapSourceTypeToInt(org.SourceType),
            OrganisationTypeId = org.OrganisationTypeId
        };

        var postal = org.Addresses.FirstOrDefault(a => a.AddressType == "Postal");
        if (postal != null)
        {
            dyn.PostalStreet = postal.Street;
            dyn.PostalCode = postal.PostalCode;
            dyn.PostalCity = postal.City;
            dyn.PostalCountry = postal.Country;
        }

        var visit = org.Addresses.FirstOrDefault(a => a.AddressType == "Visit");
        if (visit != null)
        {
            dyn.VisitStreet = visit.Street;
            dyn.VisitPostalCode = visit.PostalCode;
            dyn.VisitCity = visit.City;
        }

        dyn.Email = org.Contacts.FirstOrDefault(c => c.ContactType == "Email")?.Value;
        dyn.Phone = org.Contacts.FirstOrDefault(c => c.ContactType == "Phone")?.Value;

        return dyn;
    }

    private static OrganisationStatus MapStatus(int stateCode, int statusCode) => stateCode switch
    {
        0 when statusCode == 1 => OrganisationStatus.Active,
        0 when statusCode == 2 => OrganisationStatus.New,
        1 => OrganisationStatus.Dormant,
        2 => OrganisationStatus.Deleted,
        _ => OrganisationStatus.Passive
    };

    private static SourceType MapSourceType(int? sourceType) => sourceType switch
    {
        1 => Shared.Enums.SourceType.External,
        2 => Shared.Enums.SourceType.SelfRegistered,
        _ => Shared.Enums.SourceType.Internal
    };

    private static int MapStateCode(OrganisationStatus status) => status switch
    {
        OrganisationStatus.Active or OrganisationStatus.New => 0,
        OrganisationStatus.Dormant => 1,
        OrganisationStatus.Deleted => 2,
        _ => 0
    };

    private static int MapStatusCode(OrganisationStatus status) => status switch
    {
        OrganisationStatus.Active => 1,
        OrganisationStatus.New => 2,
        _ => 1
    };

    private static int MapSourceTypeToInt(SourceType sourceType) => sourceType switch
    {
        Shared.Enums.SourceType.External => 1,
        Shared.Enums.SourceType.SelfRegistered => 2,
        Shared.Enums.SourceType.Internal => 0,
        _ => 0
    };
}
