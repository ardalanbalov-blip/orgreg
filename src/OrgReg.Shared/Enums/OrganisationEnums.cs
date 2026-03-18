namespace OrgReg.Shared.Enums;

public enum OrganisationStatus
{
    New,
    Passive,
    Active,
    Dormant,
    Deleted
}

public enum SourceType
{
    External,
    SelfRegistered,
    Internal
}

public enum MembershipType
{
    Organisation,
    Unit,
    Group
}
