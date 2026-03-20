namespace OrgReg.Shared.DTOs.Organisation;

public record RoleDto(Guid Id, string Name, string? Description, Guid EnvironmentId);
public record RoleCreateDto(string Name, string? Description, Guid EnvironmentId);
public record RoleUpdateDto(string? Name, string? Description);

public record EnvironmentDto(Guid Id, string Name, string? Description, List<RoleDto> Roles);
public record EnvironmentCreateDto(string Name, string? Description);
public record EnvironmentUpdateDto(string? Name, string? Description);
