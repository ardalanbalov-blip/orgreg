using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using OrgReg.FakeDynamics.Store;

namespace OrgReg.FakeDynamics.Controllers;

[ApiController]
[Route("api/data/v9.2/spsm_units")]
public class UnitsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery(Name = "$filter")] string? filter = null)
    {
        IEnumerable<DynUnit> query = InMemoryStore.Units.Values;

        if (!string.IsNullOrEmpty(filter) && filter.Contains("_spsm_organisationid_value"))
        {
            var orgIdStr = filter.Split('\'')[1];
            if (Guid.TryParse(orgIdStr, out var orgId))
                query = query.Where(u => u.OrganisationId == orgId);
        }

        return Ok(new { value = query.ToList() });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(Guid id)
    {
        return InMemoryStore.Units.TryGetValue(id, out var unit) ? Ok(unit) : NotFound();
    }

    [HttpPost]
    public IActionResult Create([FromBody] JsonElement body)
    {
        var id = Guid.NewGuid();
        var unit = new DynUnit
        {
            UnitId = id,
            Name = body.TryGetProperty("spsm_name", out var n) ? n.GetString()! : "",
            OrganisationId = body.TryGetProperty("spsm_organisationid", out var o) ? Guid.Parse(o.GetString()!) : null,
            UnitTypeName = body.TryGetProperty("spsm_unittypename", out var t) ? t.GetString() : null,
        };
        InMemoryStore.Units[id] = unit;
        Response.Headers["OData-EntityId"] = $"spsm_units({id})";
        return Created($"spsm_units({id})", unit);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        return InMemoryStore.Units.TryRemove(id, out _) ? NoContent() : NotFound();
    }
}
