using OrgReg.Shared.Enums;

namespace OrgReg.Shared.Models.Organisation;

public class Unit
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public OrganisationStatus Status { get; set; } = OrganisationStatus.New;
    public SourceType SourceType { get; set; } = SourceType.Internal;
    public Guid UnitTypeId { get; set; }
    public UnitType UnitType { get; set; } = null!;
    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;
    public List<EducationType> EducationTypes { get; set; } = new();
    public List<Group> Groups { get; set; } = new();
    public List<UnitMembership> Memberships { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
