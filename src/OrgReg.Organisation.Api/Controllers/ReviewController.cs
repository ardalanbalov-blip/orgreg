using Microsoft.AspNetCore.Mvc;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Enums;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ReviewController : ControllerBase
{
    private readonly OrganisationService _service;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(OrganisationService service, ILogger<ReviewController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all organisations pending review (status = New, sourceType = SelfRegistered)
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingReview([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var all = await _service.GetAllAsync(1, 500);
        var pending = all.Items
            .Where(o => o.Status == OrganisationStatus.New && o.SourceType == SourceType.SelfRegistered)
            .ToList();

        return Ok(new
        {
            items = pending.Skip((page - 1) * pageSize).Take(pageSize),
            totalCount = pending.Count,
            page,
            pageSize
        });
    }

    /// <summary>
    /// Approve an organisation (set status to Active)
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var org = await _service.GetByIdAsync(id);
        if (org == null) return NotFound();

        var updated = await _service.UpdateAsync(id, new OrganisationUpdateDto(null, null, OrganisationStatus.Active, null));
        _logger.LogInformation("Organisation {Id} approved", id);
        return Ok(updated);
    }

    /// <summary>
    /// Reject an organisation (set status to Deleted)
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var org = await _service.GetByIdAsync(id);
        if (org == null) return NotFound();

        var updated = await _service.UpdateAsync(id, new OrganisationUpdateDto(null, null, OrganisationStatus.Deleted, null));
        _logger.LogInformation("Organisation {Id} rejected", id);
        return Ok(updated);
    }
}
