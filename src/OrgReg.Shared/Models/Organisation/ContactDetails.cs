namespace OrgReg.Shared.Models.Organisation;

public class ContactDetails
{
    public Guid Id { get; set; }
    public string ContactType { get; set; } = string.Empty; // Email, Phone, etc.
    public string Value { get; set; } = string.Empty;
    public Guid OrganisationId { get; set; }
}
