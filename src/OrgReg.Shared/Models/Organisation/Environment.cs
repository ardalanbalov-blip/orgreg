namespace OrgReg.Shared.Models.Organisation;

public class Environment
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<Role> Roles { get; set; } = new();
}
