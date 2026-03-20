using Microsoft.AspNetCore.Mvc;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class MembershipsController : ControllerBase
{
    private readonly MembershipService _service;

    public MembershipsController(MembershipService service)
    {
        _service = service;
    }

    [HttpGet("by-organisation/{organisationId:guid}")]
    public async Task<IActionResult> GetByOrganisation(Guid organisationId)
    {
        var memberships = await _service.GetByOrganisationIdAsync(organisationId);
        return Ok(memberships);
    }

    [HttpPost("organisation/{organisationId:guid}")]
    public async Task<IActionResult> AddMember(Guid organisationId, [FromBody] MembershipCreateDto dto)
    {
        var membership = await _service.AddMemberAsync(organisationId, dto);
        return membership != null ? Ok(membership) : NotFound();
    }
}
