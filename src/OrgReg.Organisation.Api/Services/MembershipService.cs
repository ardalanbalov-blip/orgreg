using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Organisation.Api.Services;

public class MembershipService
{
    private readonly IOrganisationRepository _orgRepo;
    private readonly IUserRepository _userRepo;

    public MembershipService(IOrganisationRepository orgRepo, IUserRepository userRepo)
    {
        _orgRepo = orgRepo;
        _userRepo = userRepo;
    }

    public async Task<IReadOnlyList<MembershipDto>> GetByOrganisationIdAsync(Guid organisationId)
    {
        var org = await _orgRepo.GetByIdAsync(organisationId);
        if (org == null) return Array.Empty<MembershipDto>();

        return org.Memberships.Select(m => new MembershipDto(
            m.Id,
            m.UserId,
            m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "",
            m.RoleId,
            m.Role?.Name,
            m.StartDate,
            m.EndDate
        )).ToList();
    }

    public async Task<MembershipDto?> AddMemberAsync(Guid organisationId, MembershipCreateDto dto)
    {
        var org = await _orgRepo.GetByIdAsync(organisationId);
        if (org == null) return null;

        var user = await _userRepo.GetByIdAsync(dto.UserId);
        if (user == null) return null;

        var membership = new OrganisationMembership
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            OrganisationId = organisationId,
            RoleId = dto.RoleId,
            StartDate = dto.StartDate ?? DateTime.UtcNow,
            EndDate = dto.EndDate
        };

        org.Memberships.Add(membership);
        await _orgRepo.UpdateAsync(org);

        return new MembershipDto(
            membership.Id,
            membership.UserId,
            $"{user.FirstName} {user.LastName}",
            membership.RoleId,
            null,
            membership.StartDate,
            membership.EndDate
        );
    }
}
