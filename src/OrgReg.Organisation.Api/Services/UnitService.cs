using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class UnitService
{
    private readonly IUnitRepository _repository;

    public UnitService(IUnitRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<UnitDto>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var units = await _repository.GetByOrganisationIdAsync(organisationId);
        return units.Select(MapToDto).ToList();
    }

    public async Task<UnitDto?> GetByIdAsync(Guid id)
    {
        var unit = await _repository.GetByIdAsync(id);
        return unit != null ? MapToDto(unit) : null;
    }

    public async Task<UnitDto> CreateAsync(UnitCreateDto dto)
    {
        var unit = new Unit
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            SourceType = dto.SourceType,
            UnitTypeId = dto.UnitTypeId,
            OrganisationId = dto.OrganisationId
        };

        var created = await _repository.CreateAsync(unit);
        return MapToDto(created);
    }

    public async Task<UnitDto?> UpdateAsync(Guid id, UnitUpdateDto dto)
    {
        var unit = await _repository.GetByIdAsync(id);
        if (unit == null) return null;

        if (dto.Name != null) unit.Name = dto.Name;
        if (dto.Status.HasValue) unit.Status = dto.Status.Value;
        if (dto.UnitTypeId.HasValue) unit.UnitTypeId = dto.UnitTypeId.Value;

        var updated = await _repository.UpdateAsync(unit);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var unit = await _repository.GetByIdAsync(id);
        if (unit == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static UnitDto MapToDto(Unit unit) => new(
        unit.Id,
        unit.Name,
        unit.Status,
        unit.SourceType,
        new UnitTypeDto(unit.UnitType?.Id ?? unit.UnitTypeId, unit.UnitType?.Name ?? string.Empty, unit.UnitType?.Description),
        unit.OrganisationId,
        unit.EducationTypes.Select(e => new EducationTypeDto(e.Id, e.Name, e.Code, e.Description)).ToList(),
        unit.CreatedAt,
        unit.UpdatedAt
    );
}
