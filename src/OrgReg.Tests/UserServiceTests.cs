using Moq;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Tests;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _repoMock = new Mock<IUserRepository>();
        _service = new UserService(_repoMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((User?)null);

        var result = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsDto_WhenFound()
    {
        var user = CreateTestUser();
        _repoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _service.GetByIdAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal(user.FirstName, result.FirstName);
        Assert.Equal(user.LastName, result.LastName);
        Assert.Equal(user.Email, result.Email);
    }

    [Fact]
    public async Task CreateAsync_ReturnsDto()
    {
        var dto = new UserCreateDto("Anna", "Andersson", "anna@test.se", "SPSM-001");
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        var result = await _service.CreateAsync(dto);

        Assert.Equal("Anna", result.FirstName);
        Assert.Equal("Andersson", result.LastName);
        Assert.Equal("anna@test.se", result.Email);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((User?)null);

        var result = await _service.UpdateAsync(Guid.NewGuid(), new UserUpdateDto("New", null, null, null));

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesFirstName()
    {
        var user = CreateTestUser();
        _repoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        var result = await _service.UpdateAsync(user.Id, new UserUpdateDto("Updated", null, null, null));

        Assert.NotNull(result);
        Assert.Equal("Updated", result.FirstName);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((User?)null);

        var result = await _service.DeleteAsync(Guid.NewGuid());

        Assert.False(result);
    }

    private static User CreateTestUser() => new()
    {
        Id = Guid.NewGuid(),
        FirstName = "Anna",
        LastName = "Andersson",
        Email = "anna@test.se",
        SpsmAccountId = "SPSM-001"
    };
}
