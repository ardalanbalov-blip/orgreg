using Microsoft.AspNetCore.Mvc;
using OrgReg.Organisation.Api.Services;
using OrgReg.Shared.DTOs.Organisation;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class RolesController : ControllerBase
{
    private readonly RoleService _service;

    public RolesController(RoleService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("by-environment/{environmentId:guid}")]
    public async Task<IActionResult> GetByEnvironment(Guid environmentId) =>
        Ok(await _service.GetByEnvironmentIdAsync(environmentId));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var role = await _service.GetByIdAsync(id);
        return role != null ? Ok(role) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoleCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RoleUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated != null ? Ok(updated) : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) =>
        await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
