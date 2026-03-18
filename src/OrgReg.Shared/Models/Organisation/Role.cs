namespace OrgReg.Shared.Models.Organisation;

public class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;
}
