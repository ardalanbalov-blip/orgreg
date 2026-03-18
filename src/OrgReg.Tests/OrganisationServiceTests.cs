using Moq;
using Microsoft.Extensions.Logging;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Tests;

public class OrganisationServiceTests
{
    private readonly Mock<IOrganisationRepository> _repoMock;
    private readonly OrganisationService _service;

    public OrganisationServiceTests()
    {
        _repoMock = new Mock<IOrganisationRepository>();
        var logger = Mock.Of<ILogger<OrganisationService>>();
        _service = new OrganisationService(_repoMock.Object, logger);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Shared.Models.Organisation.Organisation?)null);

        var result = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsDto_WhenFound()
    {
        var org = CreateTestOrganisation();
        _repoMock.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);

        var result = await _service.GetByIdAsync(org.Id);

        Assert.NotNull(result);
        Assert.Equal(org.Name, result.Name);
        Assert.Equal(org.OrgNumber, result.OrgNumber);
    }

    [Fact]
    public async Task CreateAsync_SetsPassiveStatus_ForExternalSource()
    {
        var dto = new OrganisationCreateDto(
            "Test Org",
            "123456-7890",
            SourceType.External,
            Guid.NewGuid(),
            null, null
        );

        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Shared.Models.Organisation.Organisation>()))
            .ReturnsAsync((Shared.Models.Organisation.Organisation o) => o);

        var result = await _service.CreateAsync(dto);

        Assert.Equal(OrganisationStatus.Passive, result.Status);
    }

    [Fact]
    public async Task CreateAsync_SetsNewStatus_ForInternalSource()
    {
        var dto = new OrganisationCreateDto(
            "Test Org",
            "123456-7890",
            SourceType.Internal,
            Guid.NewGuid(),
            null, null
        );

        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Shared.Models.Organisation.Organisation>()))
            .ReturnsAsync((Shared.Models.Organisation.Organisation o) => o);

        var result = await _service.CreateAsync(dto);

        Assert.Equal(OrganisationStatus.New, result.Status);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsPaged()
    {
        var orgs = new List<Shared.Models.Organisation.Organisation> { CreateTestOrganisation(), CreateTestOrganisation() };
        _repoMock.Setup(r => r.GetAllAsync(1, 50)).ReturnsAsync(orgs);
        _repoMock.Setup(r => r.CountAsync()).ReturnsAsync(2);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Items.Count);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Shared.Models.Organisation.Organisation?)null);

        var result = await _service.UpdateAsync(Guid.NewGuid(), new OrganisationUpdateDto("New Name", null, null, null));

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesName()
    {
        var org = CreateTestOrganisation();
        _repoMock.Setup(r => r.GetByIdAsync(org.Id)).ReturnsAsync(org);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Shared.Models.Organisation.Organisation>()))
            .ReturnsAsync((Shared.Models.Organisation.Organisation o) => o);

        var result = await _service.UpdateAsync(org.Id, new OrganisationUpdateDto("Updated Name", null, null, null));

        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Shared.Models.Organisation.Organisation?)null);

        var result = await _service.DeleteAsync(Guid.NewGuid());

        Assert.False(result);
    }

    private static Shared.Models.Organisation.Organisation CreateTestOrganisation() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Test Organisation",
        OrgNumber = "123456-7890",
        Status = OrganisationStatus.Active,
        SourceType = SourceType.Internal,
        OrganisationTypeId = Guid.NewGuid(),
        OrganisationType = new OrganisationType { Id = Guid.NewGuid(), Name = "Kommun" }
    };
}
