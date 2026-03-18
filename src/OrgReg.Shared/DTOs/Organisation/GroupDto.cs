namespace OrgReg.Shared.DTOs.Organisation;

public record GroupDto(
    Guid Id,
    string Name,
    string? Description,
    Guid? OrganisationId,
    Guid? UnitId,
    List<RoleDto> Roles,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record GroupCreateDto(
    string Name,
    string? Description,
    Guid? OrganisationId,
    Guid? UnitId,
    List<Guid>? RoleIds
);

public record GroupUpdateDto(
    string? Name,
    string? Description
);
