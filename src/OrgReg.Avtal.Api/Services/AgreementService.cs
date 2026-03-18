using OrgReg.Shared.DTOs;
using OrgReg.Shared.DTOs.Avtal;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Avtal.Api.Services;

public class AgreementService
{
    private readonly IAgreementRepository _repository;
    private readonly ILogger<AgreementService> _logger;

    public AgreementService(IAgreementRepository repository, ILogger<AgreementService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<AgreementDto>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        var agreements = await _repository.GetAllAsync(page, pageSize);
        var count = await _repository.CountAsync();
        return new PagedResult<AgreementDto>(
            agreements.Select(MapToDto).ToList(),
            count, page, pageSize
        );
    }

    public async Task<AgreementDto?> GetByIdAsync(Guid id)
    {
        var agreement = await _repository.GetByIdAsync(id);
        return agreement != null ? MapToDto(agreement) : null;
    }

    public async Task<IReadOnlyList<AgreementDto>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var agreements = await _repository.GetByOrganisationIdAsync(organisationId);
        return agreements.Select(MapToDto).ToList();
    }

    public async Task<AgreementDto> CreateAsync(AgreementCreateDto dto)
    {
        var validity = new Validity
        {
            Id = Guid.NewGuid(),
            StartDate = dto.Validity.StartDate,
            EndDate = dto.Validity.EndDate,
            RenewalLogic = dto.Validity.RenewalLogic,
            TerminationCondition = dto.Validity.TerminationCondition
        };

        var agreement = new Agreement
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            OrganisationId = dto.OrganisationId,
            AgreementTypeId = dto.AgreementTypeId,
            ValidityId = validity.Id,
            Validity = validity,
            TemplateId = dto.TemplateId
        };

        var created = await _repository.CreateAsync(agreement);
        _logger.LogInformation("Agreement {Id} created for organisation {OrgId}", created.Id, dto.OrganisationId);
        return MapToDto(created);
    }

    public async Task<AgreementDto?> UpdateAsync(Guid id, AgreementUpdateDto dto)
    {
        var agreement = await _repository.GetByIdAsync(id);
        if (agreement == null) return null;

        if (dto.Name != null) agreement.Name = dto.Name;
        if (dto.Description != null) agreement.Description = dto.Description;
        if (dto.AgreementTypeId.HasValue) agreement.AgreementTypeId = dto.AgreementTypeId.Value;
        if (dto.TemplateId.HasValue) agreement.TemplateId = dto.TemplateId;

        var updated = await _repository.UpdateAsync(agreement);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var agreement = await _repository.GetByIdAsync(id);
        if (agreement == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static AgreementDto MapToDto(Agreement a) => new(
        a.Id,
        a.Name,
        a.Description,
        a.OrganisationId,
        new AgreementTypeDto(a.AgreementType?.Id ?? a.AgreementTypeId, a.AgreementType?.Name ?? string.Empty, a.AgreementType?.Description),
        new ValidityDto(a.Validity.Id, a.Validity.StartDate, a.Validity.EndDate, a.Validity.RenewalLogic, a.Validity.TerminationCondition),
        a.Template != null ? new TemplateDto(a.Template.Id, a.Template.Name, a.Template.Content, a.Template.CreatedAt) : null,
        a.CreatedAt,
        a.UpdatedAt
    );
}
