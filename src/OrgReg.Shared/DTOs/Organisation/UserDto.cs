namespace OrgReg.Shared.DTOs.Organisation;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? Email,
    string? SpsmAccountId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record UserCreateDto(
    string FirstName,
    string LastName,
    string? Email,
    string? SpsmAccountId
);

public record UserUpdateDto(
    string? FirstName,
    string? LastName,
    string? Email,
    string? SpsmAccountId
);
