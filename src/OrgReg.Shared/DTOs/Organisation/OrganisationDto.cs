using OrgReg.Shared.Enums;

namespace OrgReg.Shared.DTOs.Organisation;

public record OrganisationDto(
    Guid Id,
    string Name,
    string? OrgNumber,
    OrganisationStatus Status,
    SourceType SourceType,
    OrganisationTypeDto OrganisationType,
    List<AddressDto> Addresses,
    List<ContactDto> Contacts,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record OrganisationCreateDto(
    string Name,
    string? OrgNumber,
    SourceType SourceType,
    Guid OrganisationTypeId,
    List<AddressCreateDto>? Addresses,
    List<ContactCreateDto>? Contacts
);

public record OrganisationUpdateDto(
    string? Name,
    string? OrgNumber,
    OrganisationStatus? Status,
    Guid? OrganisationTypeId
);

public record OrganisationTypeDto(Guid Id, string Name, string? Description);

public record AddressDto(Guid Id, string AddressType, string? Street, string? PostalCode, string? City, string? Country);
public record AddressCreateDto(string AddressType, string? Street, string? PostalCode, string? City, string? Country);

public record ContactDto(Guid Id, string ContactType, string Value);
public record ContactCreateDto(string ContactType, string Value);
