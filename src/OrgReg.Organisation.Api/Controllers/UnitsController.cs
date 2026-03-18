using Microsoft.AspNetCore.Mvc;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class UnitsController : ControllerBase
{
    private readonly UnitService _service;

    public UnitsController(UnitService service)
    {
        _service = service;
    }

    [HttpGet("by-organisation/{organisationId:guid}")]
    public async Task<IActionResult> GetByOrganisation(Guid organisationId)
    {
        var units = await _service.GetByOrganisationIdAsync(organisationId);
        return Ok(units);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var unit = await _service.GetByIdAsync(id);
        return unit != null ? Ok(unit) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UnitCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UnitUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated != null ? Ok(updated) : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
