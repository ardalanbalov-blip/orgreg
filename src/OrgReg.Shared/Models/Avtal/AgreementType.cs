namespace OrgReg.Shared.Models.Avtal;

public class AgreementType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
