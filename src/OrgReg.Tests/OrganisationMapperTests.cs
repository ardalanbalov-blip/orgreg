using OrgReg.Dynamics.Mapping;
using OrgReg.Dynamics.Models;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Tests;

public class OrganisationMapperTests
{
    [Fact]
    public void ToDomain_MapsBasicFields()
    {
        var dyn = new DynamicsOrganisation
        {
            AccountId = Guid.NewGuid(),
            Name = "Test Org",
            OrgNumber = "556677-8899",
            StateCode = 0,
            StatusCode = 1,
            SourceType = 0,
            OrganisationTypeId = Guid.NewGuid(),
            OrganisationTypeName = "Kommun"
        };

        var result = OrganisationMapper.ToDomain(dyn);

        Assert.Equal(dyn.AccountId, result.Id);
        Assert.Equal(dyn.Name, result.Name);
        Assert.Equal(dyn.OrgNumber, result.OrgNumber);
        Assert.Equal(OrganisationStatus.Active, result.Status);
        Assert.Equal(SourceType.Internal, result.SourceType);
    }

    [Fact]
    public void ToDomain_MapsAddresses()
    {
        var dyn = new DynamicsOrganisation
        {
            AccountId = Guid.NewGuid(),
            Name = "Test",
            PostalStreet = "Gatuvägen 1",
            PostalCode = "12345",
            PostalCity = "Stockholm",
            PostalCountry = "Sverige",
            VisitStreet = "Besöksvägen 2",
            VisitPostalCode = "54321",
            VisitCity = "Göteborg"
        };

        var result = OrganisationMapper.ToDomain(dyn);

        Assert.Equal(2, result.Addresses.Count);
        Assert.Contains(result.Addresses, a => a.AddressType == "Postal" && a.Street == "Gatuvägen 1");
        Assert.Contains(result.Addresses, a => a.AddressType == "Visit" && a.Street == "Besöksvägen 2");
    }

    [Fact]
    public void ToDomain_MapsContacts()
    {
        var dyn = new DynamicsOrganisation
        {
            AccountId = Guid.NewGuid(),
            Name = "Test",
            Email = "test@spsm.se",
            Phone = "08-1234567"
        };

        var result = OrganisationMapper.ToDomain(dyn);

        Assert.Equal(2, result.Contacts.Count);
        Assert.Contains(result.Contacts, c => c.ContactType == "Email" && c.Value == "test@spsm.se");
        Assert.Contains(result.Contacts, c => c.ContactType == "Phone" && c.Value == "08-1234567");
    }

    [Fact]
    public void ToDynamics_RoundTrips()
    {
        var org = new Shared.Models.Organisation.Organisation
        {
            Id = Guid.NewGuid(),
            Name = "Round Trip Org",
            OrgNumber = "1122-3344",
            Status = OrganisationStatus.Active,
            SourceType = SourceType.Internal,
            OrganisationTypeId = Guid.NewGuid(),
            Addresses = new List<AddressDetails>
            {
                new() { AddressType = "Postal", Street = "Testvägen 1", PostalCode = "11111", City = "Test" }
            },
            Contacts = new List<ContactDetails>
            {
                new() { ContactType = "Email", Value = "round@trip.se" }
            }
        };

        var dyn = OrganisationMapper.ToDynamics(org);
        var result = OrganisationMapper.ToDomain(dyn);

        Assert.Equal(org.Name, result.Name);
        Assert.Equal(org.OrgNumber, result.OrgNumber);
        Assert.Single(result.Addresses);
        Assert.Single(result.Contacts);
    }

    [Theory]
    [InlineData(0, 1, OrganisationStatus.Active)]
    [InlineData(0, 2, OrganisationStatus.New)]
    [InlineData(1, 1, OrganisationStatus.Dormant)]
    [InlineData(2, 1, OrganisationStatus.Deleted)]
    public void ToDomain_MapsStatusCorrectly(int stateCode, int statusCode, OrganisationStatus expected)
    {
        var dyn = new DynamicsOrganisation
        {
            AccountId = Guid.NewGuid(),
            Name = "Status Test",
            StateCode = stateCode,
            StatusCode = statusCode
        };

        var result = OrganisationMapper.ToDomain(dyn);

        Assert.Equal(expected, result.Status);
    }
}
