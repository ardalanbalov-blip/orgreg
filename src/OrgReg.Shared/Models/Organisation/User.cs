namespace OrgReg.Shared.Models.Organisation;

public class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? SpsmAccountId { get; set; }
    public List<OrganisationMembership> OrganisationMemberships { get; set; } = new();
    public List<UnitMembership> UnitMemberships { get; set; } = new();
    public List<GroupMembership> GroupMemberships { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
