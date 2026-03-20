using Microsoft.AspNetCore.Mvc;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Enums;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class MembershipsController : ControllerBase
{
    private readonly MembershipService _service;

    public MembershipsController(MembershipService service) => _service = service;

    // --- Organisation Memberships ---

    [HttpGet("by-organisation/{organisationId:guid}")]
    public async Task<IActionResult> GetByOrganisation(Guid organisationId)
        => Ok(await _service.GetByOrganisationIdAsync(organisationId));

    [HttpPost("organisation/{organisationId:guid}")]
    public async Task<IActionResult> AddOrgMember(Guid organisationId, [FromBody] MembershipCreateDto dto)
    {
        var result = await _service.AddMemberAsync(MembershipType.Organisation, organisationId, dto);
        return result != null ? Ok(result) : NotFound();
    }

    // --- Unit Memberships ---

    [HttpGet("by-unit/{unitId:guid}")]
    public async Task<IActionResult> GetByUnit(Guid unitId)
        => Ok(await _service.GetByEntityIdAsync(MembershipType.Unit, unitId));

    [HttpPost("unit/{unitId:guid}")]
    public async Task<IActionResult> AddUnitMember(Guid unitId, [FromBody] MembershipCreateDto dto)
    {
        var result = await _service.AddMemberAsync(MembershipType.Unit, unitId, dto);
        return result != null ? Ok(result) : NotFound();
    }

    // --- Group Memberships ---

    [HttpGet("by-group/{groupId:guid}")]
    public async Task<IActionResult> GetByGroup(Guid groupId)
        => Ok(await _service.GetByEntityIdAsync(MembershipType.Group, groupId));

    [HttpPost("group/{groupId:guid}")]
    public async Task<IActionResult> AddGroupMember(Guid groupId, [FromBody] MembershipCreateDto dto)
    {
        var result = await _service.AddMemberAsync(MembershipType.Group, groupId, dto);
        return result != null ? Ok(result) : NotFound();
    }
}
