namespace OrgReg.Shared.Models.Avtal;

public class Agreement
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid AgreementTypeId { get; set; }
    public AgreementType AgreementType { get; set; } = null!;
    public Guid ValidityId { get; set; }
    public Validity Validity { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public Template? Template { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
