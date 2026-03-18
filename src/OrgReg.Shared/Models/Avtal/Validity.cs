namespace OrgReg.Shared.Models.Avtal;

public class Validity
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? RenewalLogic { get; set; }
    public string? TerminationCondition { get; set; }
}
