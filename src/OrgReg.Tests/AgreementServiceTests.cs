using Moq;
using Microsoft.Extensions.Logging;
using OrgReg.Avtal.Api.Services;
using OrgReg.Shared.DTOs.Avtal;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Tests;

public class AgreementServiceTests
{
    private readonly Mock<IAgreementRepository> _repoMock;
    private readonly AgreementService _service;

    public AgreementServiceTests()
    {
        _repoMock = new Mock<IAgreementRepository>();
        var logger = Mock.Of<ILogger<AgreementService>>();
        _service = new AgreementService(_repoMock.Object, logger);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Agreement?)null);

        var result = await _service.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsDto_WhenFound()
    {
        var agreement = CreateTestAgreement();
        _repoMock.Setup(r => r.GetByIdAsync(agreement.Id)).ReturnsAsync(agreement);

        var result = await _service.GetByIdAsync(agreement.Id);

        Assert.NotNull(result);
        Assert.Equal(agreement.Name, result.Name);
    }

    [Fact]
    public async Task CreateAsync_CreatesWithValidity()
    {
        var dto = new AgreementCreateDto(
            "Test Agreement",
            "Description",
            Guid.NewGuid(),
            Guid.NewGuid(),
            new ValidityCreateDto(DateTime.UtcNow, DateTime.UtcNow.AddYears(1), null, null),
            null
        );

        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Agreement>()))
            .ReturnsAsync((Agreement a) =>
            {
                a.AgreementType = new AgreementType { Id = a.AgreementTypeId, Name = "PUB-avtal" };
                return a;
            });

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.NotNull(result.Validity);
    }

    [Fact]
    public async Task GetByOrganisationIdAsync_ReturnsAgreements()
    {
        var orgId = Guid.NewGuid();
        var agreements = new List<Agreement> { CreateTestAgreement(orgId), CreateTestAgreement(orgId) };
        _repoMock.Setup(r => r.GetByOrganisationIdAsync(orgId)).ReturnsAsync(agreements);

        var result = await _service.GetByOrganisationIdAsync(orgId);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Agreement?)null);

        var result = await _service.DeleteAsync(Guid.NewGuid());

        Assert.False(result);
    }

    private static Agreement CreateTestAgreement(Guid? orgId = null) => new()
    {
        Id = Guid.NewGuid(),
        Name = "Test Agreement",
        OrganisationId = orgId ?? Guid.NewGuid(),
        AgreementTypeId = Guid.NewGuid(),
        AgreementType = new AgreementType { Id = Guid.NewGuid(), Name = "PUB-avtal" },
        ValidityId = Guid.NewGuid(),
        Validity = new Validity
        {
            Id = Guid.NewGuid(),
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(1)
        }
    };
}
