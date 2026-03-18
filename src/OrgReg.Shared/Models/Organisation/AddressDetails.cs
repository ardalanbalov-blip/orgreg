namespace OrgReg.Shared.Models.Organisation;

public class AddressDetails
{
    public Guid Id { get; set; }
    public string AddressType { get; set; } = string.Empty; // Post, Visit, etc.
    public string? Street { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public Guid OrganisationId { get; set; }
}
