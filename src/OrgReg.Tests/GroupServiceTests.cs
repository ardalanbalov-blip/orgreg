using Moq;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Tests;

public class GroupServiceTests
{
    private readonly Mock<IGroupRepository> _repoMock;
    private readonly GroupService _service;

    public GroupServiceTests()
    {
        _repoMock = new Mock<IGroupRepository>();
        _service = new GroupService(_repoMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Group?)null);

        var result = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsDto_WhenFound()
    {
        var group = CreateTestGroup();
        _repoMock.Setup(r => r.GetByIdAsync(group.Id)).ReturnsAsync(group);

        var result = await _service.GetByIdAsync(group.Id);

        Assert.NotNull(result);
        Assert.Equal(group.Name, result.Name);
    }

    [Fact]
    public async Task CreateAsync_ReturnsDto()
    {
        var orgId = Guid.NewGuid();
        var dto = new GroupCreateDto("Arbetslag 1", "Beskrivning", orgId, null, null);
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Group>())).ReturnsAsync((Group g) => g);

        var result = await _service.CreateAsync(dto);

        Assert.Equal("Arbetslag 1", result.Name);
        Assert.Equal(orgId, result.OrganisationId);
    }

    [Fact]
    public async Task GetByOrganisationIdAsync_ReturnsGroups()
    {
        var orgId = Guid.NewGuid();
        var groups = new List<Group> { CreateTestGroup(orgId), CreateTestGroup(orgId) };
        _repoMock.Setup(r => r.GetByOrganisationIdAsync(orgId)).ReturnsAsync(groups);

        var result = await _service.GetByOrganisationIdAsync(orgId);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Group?)null);

        var result = await _service.DeleteAsync(Guid.NewGuid());

        Assert.False(result);
    }

    private static Group CreateTestGroup(Guid? orgId = null) => new()
    {
        Id = Guid.NewGuid(),
        Name = "Testgrupp",
        Description = "En testgrupp",
        OrganisationId = orgId ?? Guid.NewGuid()
    };
}
