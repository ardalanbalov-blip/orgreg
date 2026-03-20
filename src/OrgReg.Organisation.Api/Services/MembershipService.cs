using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Enums;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class MembershipService
{
    private readonly IOrganisationRepository _orgRepo;
    private readonly IUnitRepository _unitRepo;
    private readonly IGroupRepository _groupRepo;
    private readonly IUserRepository _userRepo;

    public MembershipService(
        IOrganisationRepository orgRepo,
        IUnitRepository unitRepo,
        IGroupRepository groupRepo,
        IUserRepository userRepo)
    {
        _orgRepo = orgRepo;
        _unitRepo = unitRepo;
        _groupRepo = groupRepo;
        _userRepo = userRepo;
    }

    // --- Organisation Memberships ---

    public async Task<IReadOnlyList<MembershipDto>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var org = await _orgRepo.GetByIdAsync(organisationId);
        if (org == null) return Array.Empty<MembershipDto>();

        return org.Memberships.Select(m => new MembershipDto(
            m.Id, m.UserId,
            m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "",
            m.RoleId, m.Role?.Name, m.StartDate, m.EndDate
        )).ToList();
    }

    // --- Generic by type ---

    public async Task<IReadOnlyList<MembershipDto>> GetByEntityIdAsync(MembershipType type, Guid entityId)
    {
        return type switch
        {
            MembershipType.Organisation => await GetByOrganisationIdAsync(entityId),
            MembershipType.Unit => await GetByUnitIdAsync(entityId),
            MembershipType.Group => await GetByGroupIdAsync(entityId),
            _ => Array.Empty<MembershipDto>()
        };
    }

    public async Task<MembershipDto?> AddMemberAsync(MembershipType type, Guid entityId, MembershipCreateDto dto)
    {
        var user = await _userRepo.GetByIdAsync(dto.UserId);
        if (user == null) return null;

        var userName = $"{user.FirstName} {user.LastName}";
        var startDate = dto.StartDate ?? DateTime.UtcNow;

        return type switch
        {
            MembershipType.Organisation => await AddOrgMemberAsync(entityId, dto, userName, startDate),
            MembershipType.Unit => await AddUnitMemberAsync(entityId, dto, userName, startDate),
            MembershipType.Group => await AddGroupMemberAsync(entityId, dto, userName, startDate),
            _ => null
        };
    }

    // --- Unit Memberships ---

    private async Task<IReadOnlyList<MembershipDto>> GetByUnitIdAsync(Guid unitId)
    {
        var unit = await _unitRepo.GetByIdAsync(unitId);
        if (unit == null) return Array.Empty<MembershipDto>();

        return unit.Memberships.Select(m => new MembershipDto(
            m.Id, m.UserId,
            m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "",
            m.RoleId, m.Role?.Name, m.StartDate, m.EndDate
        )).ToList();
    }

    // --- Group Memberships ---

    private async Task<IReadOnlyList<MembershipDto>> GetByGroupIdAsync(Guid groupId)
    {
        var group = await _groupRepo.GetByIdAsync(groupId);
        if (group == null) return Array.Empty<MembershipDto>();

        return group.Memberships.Select(m => new MembershipDto(
            m.Id, m.UserId,
            m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "",
            null, null, m.StartDate, m.EndDate
        )).ToList();
    }

    // --- Add helpers ---

    private async Task<MembershipDto?> AddOrgMemberAsync(Guid orgId, MembershipCreateDto dto, string userName, DateTime startDate)
    {
        var org = await _orgRepo.GetByIdAsync(orgId);
        if (org == null) return null;

        var membership = new OrganisationMembership
        {
            Id = Guid.NewGuid(), UserId = dto.UserId, OrganisationId = orgId,
            RoleId = dto.RoleId, StartDate = startDate, EndDate = dto.EndDate
        };
        org.Memberships.Add(membership);
        await _orgRepo.UpdateAsync(org);

        return new MembershipDto(membership.Id, dto.UserId, userName, dto.RoleId, null, startDate, dto.EndDate);
    }

    private async Task<MembershipDto?> AddUnitMemberAsync(Guid unitId, MembershipCreateDto dto, string userName, DateTime startDate)
    {
        var unit = await _unitRepo.GetByIdAsync(unitId);
        if (unit == null) return null;

        var membership = new UnitMembership
        {
            Id = Guid.NewGuid(), UserId = dto.UserId, UnitId = unitId,
            RoleId = dto.RoleId, StartDate = startDate, EndDate = dto.EndDate
        };
        unit.Memberships.Add(membership);
        await _unitRepo.UpdateAsync(unit);

        return new MembershipDto(membership.Id, dto.UserId, userName, dto.RoleId, null, startDate, dto.EndDate);
    }

    private async Task<MembershipDto?> AddGroupMemberAsync(Guid groupId, MembershipCreateDto dto, string userName, DateTime startDate)
    {
        var group = await _groupRepo.GetByIdAsync(groupId);
        if (group == null) return null;

        var membership = new GroupMembership
        {
            Id = Guid.NewGuid(), UserId = dto.UserId, GroupId = groupId,
            StartDate = startDate, EndDate = dto.EndDate
        };
        group.Memberships.Add(membership);
        await _groupRepo.UpdateAsync(group);

        return new MembershipDto(membership.Id, dto.UserId, userName, null, null, startDate, dto.EndDate);
    }
}
