using Microsoft.AspNetCore.Mvc;
using OrgReg.Shared.DTOs.Organisation;
using OrgReg.Shared.Interfaces;

namespace OrgReg.Organisation.Api.Controllers;

[ApiController]
[Route("api/v1/reference-data")]
[Produces("application/json")]
public class ReferenceDataController : ControllerBase
{
    private readonly IReferenceDataRepository _repository;

    public ReferenceDataController(IReferenceDataRepository repository) => _repository = repository;

    [HttpGet("organisation-types")]
    public async Task<IActionResult> GetOrganisationTypes()
    {
        var types = await _repository.GetOrganisationTypesAsync();
        return Ok(types.Select(t => new OrganisationTypeDto(t.Id, t.Name, t.Description)));
    }

    [HttpGet("unit-types")]
    public async Task<IActionResult> GetUnitTypes()
    {
        var types = await _repository.GetUnitTypesAsync();
        return Ok(types.Select(t => new UnitTypeDto(t.Id, t.Name, t.Description)));
    }

    [HttpGet("education-types")]
    public async Task<IActionResult> GetEducationTypes()
    {
        var types = await _repository.GetEducationTypesAsync();
        return Ok(types.Select(t => new EducationTypeDto(t.Id, t.Name, t.Code, t.Description)));
    }
}
