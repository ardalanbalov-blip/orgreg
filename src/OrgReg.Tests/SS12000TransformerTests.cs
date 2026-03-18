using OrgReg.Integrations.SS12000;
using OrgReg.Integrations.SS12000.Models;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Tests;

public class SS12000TransformerTests
{
    [Fact]
    public void ToOrganisation_MapsCorrectly()
    {
        var ssOrg = new SS12000Organisation
        {
            Id = Guid.NewGuid().ToString(),
            DisplayName = "Test Kommun",
            OrganisationCode = "1234",
            OrganisationType = "Kommun"
        };

        var result = SS12000Transformer.ToOrganisation(ssOrg);

        Assert.Equal(ssOrg.DisplayName, result.Name);
        Assert.Equal(ssOrg.OrganisationCode, result.OrgNumber);
        Assert.Equal(OrganisationStatus.Passive, result.Status);
        Assert.Equal(SourceType.External, result.SourceType);
        Assert.Equal("Kommun", result.OrganisationType.Name);
    }

    [Fact]
    public void ToUnit_MapsSchoolTypes()
    {
        var orgId = Guid.NewGuid();
        var ssUnit = new SS12000SchoolUnit
        {
            Id = Guid.NewGuid().ToString(),
            DisplayName = "Testskolan",
            SchoolTypes = new List<SS12000SchoolType>
            {
                new() { SchoolType = "GR" },
                new() { SchoolType = "GY" }
            },
            Organisation = new SS12000Reference { Id = orgId.ToString() }
        };

        var result = SS12000Transformer.ToUnit(ssUnit, orgId);

        Assert.Equal(ssUnit.DisplayName, result.Name);
        Assert.Equal(orgId, result.OrganisationId);
        Assert.Equal(2, result.EducationTypes.Count);
    }

    [Fact]
    public void ToUser_MapsPersonData()
    {
        var ssPerson = new SS12000Person
        {
            Id = Guid.NewGuid().ToString(),
            GivenName = "Anna",
            FamilyName = "Svensson",
            Emails = new List<SS12000Email> { new() { Value = "anna@test.se", Type = "work" } }
        };

        var result = SS12000Transformer.ToUser(ssPerson);

        Assert.Equal("Anna", result.FirstName);
        Assert.Equal("Svensson", result.LastName);
        Assert.Equal("anna@test.se", result.Email);
    }

    [Fact]
    public void FromOrganisation_RoundTrips()
    {
        var org = new Shared.Models.Organisation.Organisation
        {
            Id = Guid.NewGuid(),
            Name = "Test Org",
            OrgNumber = "5566",
            OrganisationType = new OrganisationType { Name = "Kommun" }
        };

        var ss = SS12000Transformer.FromOrganisation(org);
        var result = SS12000Transformer.ToOrganisation(ss);

        Assert.Equal(org.Name, result.Name);
        Assert.Equal(org.OrgNumber, result.OrgNumber);
    }

    [Fact]
    public void ToOrganisation_SetsPassiveStatus_ForExternalData()
    {
        var ssOrg = new SS12000Organisation
        {
            Id = Guid.NewGuid().ToString(),
            DisplayName = "External Org"
        };

        var result = SS12000Transformer.ToOrganisation(ssOrg);

        Assert.Equal(OrganisationStatus.Passive, result.Status);
        Assert.Equal(SourceType.External, result.SourceType);
    }
}
