using OrgReg.Shared.Enums;

namespace OrgReg.Shared.DTOs.Organisation;

public record UnitDto(
    Guid Id,
    string Name,
    OrganisationStatus Status,
    SourceType SourceType,
    UnitTypeDto UnitType,
    Guid OrganisationId,
    List<EducationTypeDto> EducationTypes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record UnitCreateDto(
    string Name,
    SourceType SourceType,
    Guid UnitTypeId,
    Guid OrganisationId,
    List<Guid>? EducationTypeIds
);

public record UnitUpdateDto(
    string? Name,
    OrganisationStatus? Status,
    Guid? UnitTypeId
);

public record UnitTypeDto(Guid Id, string Name, string? Description);
public record EducationTypeDto(Guid Id, string Name, string? Code, string? Description);
