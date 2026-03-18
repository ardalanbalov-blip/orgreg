namespace OrgReg.Shared.DTOs.Organisation;

public record RoleDto(Guid Id, string Name, string? Description, Guid EnvironmentId);
public record EnvironmentDto(Guid Id, string Name, string? Description, List<RoleDto> Roles);
