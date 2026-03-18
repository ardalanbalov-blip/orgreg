using OrgReg.Shared.Enums;

namespace OrgReg.Shared.Models.Organisation;

public class Organisation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? OrgNumber { get; set; }
    public OrganisationStatus Status { get; set; } = OrganisationStatus.New;
    public SourceType SourceType { get; set; } = SourceType.Internal;
    public Guid OrganisationTypeId { get; set; }
    public OrganisationType OrganisationType { get; set; } = null!;
    public List<AddressDetails> Addresses { get; set; } = new();
    public List<ContactDetails> Contacts { get; set; } = new();
    public List<Unit> Units { get; set; } = new();
    public List<Group> Groups { get; set; } = new();
    public List<OrganisationMembership> Memberships { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
