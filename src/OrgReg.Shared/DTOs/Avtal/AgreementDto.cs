namespace OrgReg.Shared.DTOs.Avtal;

public record AgreementDto(
    Guid Id,
    string Name,
    string? Description,
    Guid OrganisationId,
    AgreementTypeDto AgreementType,
    ValidityDto Validity,
    TemplateDto? Template,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AgreementCreateDto(
    string Name,
    string? Description,
    Guid OrganisationId,
    Guid AgreementTypeId,
    ValidityCreateDto Validity,
    Guid? TemplateId
);

public record AgreementUpdateDto(
    string? Name,
    string? Description,
    Guid? AgreementTypeId,
    Guid? TemplateId
);

public record AgreementTypeDto(Guid Id, string Name, string? Description);

public record ValidityDto(Guid Id, DateTime StartDate, DateTime? EndDate, string? RenewalLogic, string? TerminationCondition);
public record ValidityCreateDto(DateTime StartDate, DateTime? EndDate, string? RenewalLogic, string? TerminationCondition);

public record TemplateDto(Guid Id, string Name, string? Content, DateTime CreatedAt);
public record TemplateCreateDto(string Name, string? Content);
