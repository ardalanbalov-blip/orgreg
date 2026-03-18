namespace OrgReg.Shared.DTOs.Organisation;

public record MembershipDto(
    Guid Id,
    Guid UserId,
    string UserName,
    Guid? RoleId,
    string? RoleName,
    DateTime StartDate,
    DateTime? EndDate
);

public record MembershipCreateDto(
    Guid UserId,
    Guid? RoleId,
    DateTime? StartDate,
    DateTime? EndDate
);
