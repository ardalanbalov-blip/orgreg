using OrgReg.Shared.DTOs;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class OrganisationService
{
    private readonly IOrganisationRepository _repository;
    private readonly ILogger<OrganisationService> _logger;

    public OrganisationService(IOrganisationRepository repository, ILogger<OrganisationService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<OrganisationDto>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        var orgs = await _repository.GetAllAsync(page, pageSize);
        var count = await _repository.CountAsync();
        return new PagedResult<OrganisationDto>(
            orgs.Select(MapToDto).ToList(),
            count, page, pageSize
        );
    }

    public async Task<OrganisationDto?> GetByIdAsync(Guid id)
    {
        var org = await _repository.GetByIdAsync(id);
        return org != null ? MapToDto(org) : null;
    }

    public async Task<PagedResult<OrganisationDto>> SearchAsync(string query, int page = 1, int pageSize = 50)
    {
        var orgs = await _repository.SearchAsync(query, page, pageSize);
        return new PagedResult<OrganisationDto>(
            orgs.Select(MapToDto).ToList(),
            orgs.Count, page, pageSize
        );
    }

    public async Task<OrganisationDto> CreateAsync(OrganisationCreateDto dto)
    {
        var org = new Shared.Models.Organisation.Organisation
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            OrgNumber = dto.OrgNumber,
            SourceType = dto.SourceType,
            Status = dto.SourceType == SourceType.External ? OrganisationStatus.Passive : OrganisationStatus.New,
            OrganisationTypeId = dto.OrganisationTypeId,
            Addresses = dto.Addresses?.Select(a => new AddressDetails
            {
                Id = Guid.NewGuid(),
                AddressType = a.AddressType,
                Street = a.Street,
                PostalCode = a.PostalCode,
                City = a.City,
                Country = a.Country
            }).ToList() ?? new(),
            Contacts = dto.Contacts?.Select(c => new ContactDetails
            {
                Id = Guid.NewGuid(),
                ContactType = c.ContactType,
                Value = c.Value
            }).ToList() ?? new()
        };

        var created = await _repository.CreateAsync(org);
        _logger.LogInformation("Organisation {Id} created with source {Source}", created.Id, dto.SourceType);
        return MapToDto(created);
    }

    public async Task<OrganisationDto?> UpdateAsync(Guid id, OrganisationUpdateDto dto)
    {
        var org = await _repository.GetByIdAsync(id);
        if (org == null) return null;

        if (dto.Name != null) org.Name = dto.Name;
        if (dto.OrgNumber != null) org.OrgNumber = dto.OrgNumber;
        if (dto.Status.HasValue) org.Status = dto.Status.Value;
        if (dto.OrganisationTypeId.HasValue) org.OrganisationTypeId = dto.OrganisationTypeId.Value;

        var updated = await _repository.UpdateAsync(org);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var org = await _repository.GetByIdAsync(id);
        if (org == null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static OrganisationDto MapToDto(Shared.Models.Organisation.Organisation org) => new(
        org.Id,
        org.Name,
        org.OrgNumber,
        org.Status,
        org.SourceType,
        new OrganisationTypeDto(
            org.OrganisationType?.Id ?? org.OrganisationTypeId,
            org.OrganisationType?.Name ?? string.Empty,
            org.OrganisationType?.Description
        ),
        org.Addresses.Select(a => new AddressDto(a.Id, a.AddressType, a.Street, a.PostalCode, a.City, a.Country)).ToList(),
        org.Contacts.Select(c => new ContactDto(c.Id, c.ContactType, c.Value)).ToList(),
        org.CreatedAt,
        org.UpdatedAt
    );
}
