namespace OrgReg.Shared.Models.Organisation;

public class UnitType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
