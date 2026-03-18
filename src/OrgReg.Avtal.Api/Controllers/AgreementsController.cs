using Microsoft.AspNetCore.Mvc;
using OrgReg.Avtal.Api.Services;
using OrgReg.Shared.DTOs.Avtal;

namespace OrgReg.Avtal.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AgreementsController : ControllerBase
{
    private readonly AgreementService _service;

    public AgreementsController(AgreementService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _service.GetAllAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var agreement = await _service.GetByIdAsync(id);
        return agreement != null ? Ok(agreement) : NotFound();
    }

    [HttpGet("by-organisation/{organisationId:guid}")]
    public async Task<IActionResult> GetByOrganisation(Guid organisationId)
    {
        var agreements = await _service.GetByOrganisationIdAsync(organisationId);
        return Ok(agreements);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AgreementCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AgreementUpdateDto dto)
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
