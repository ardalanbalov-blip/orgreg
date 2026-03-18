using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using OrgReg.FakeDynamics.Store;

namespace OrgReg.FakeDynamics.Controllers;

/// <summary>
/// Fake Dynamics OData-style accounts endpoint.
/// Mimics the Dynamics Web API for development/demo.
/// </summary>
[ApiController]
[Route("api/data/v9.2/accounts")]
public class AccountsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll(
        [FromQuery(Name = "$filter")] string? filter = null,
        [FromQuery(Name = "$top")] int? top = null,
        [FromQuery(Name = "$skip")] int? skip = null,
        [FromQuery(Name = "$count")] bool count = false)
    {
        IEnumerable<DynAccount> query = InMemoryStore.Accounts.Values;

        if (!string.IsNullOrEmpty(filter) && filter.Contains("contains(name,"))
        {
            var searchTerm = filter.Split('\'')[1];
            query = query.Where(a =>
                a.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                (a.OrgNumber?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ?? false));
        }

        var total = query.Count();
        if (skip.HasValue) query = query.Skip(skip.Value);
        if (top.HasValue) query = query.Take(top.Value);

        var result = new Dictionary<string, object> { ["value"] = query.ToList() };
        if (count) result["@odata.count"] = total;
        return Ok(result);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(Guid id)
    {
        return InMemoryStore.Accounts.TryGetValue(id, out var account)
            ? Ok(account)
            : NotFound();
    }

    [HttpPost]
    public IActionResult Create([FromBody] JsonElement body)
    {
        var id = Guid.NewGuid();
        var account = new DynAccount
        {
            AccountId = id,
            Name = body.TryGetProperty("name", out var n) ? n.GetString()! : "",
            OrgNumber = body.TryGetProperty("spsm_orgnumber", out var o) ? o.GetString() : null,
            StateCode = body.TryGetProperty("statecode", out var sc) ? sc.GetInt32() : 0,
            StatusCode = body.TryGetProperty("statuscode", out var stc) ? stc.GetInt32() : 1,
            SourceType = body.TryGetProperty("spsm_sourcetype", out var st) ? st.GetInt32() : 0,
            OrganisationTypeId = body.TryGetProperty("spsm_organisationtypeid", out var ot) ? Guid.Parse(ot.GetString()!) : null,
            PostalStreet = body.TryGetProperty("address1_line1", out var ps) ? ps.GetString() : null,
            PostalCode = body.TryGetProperty("address1_postalcode", out var pc) ? pc.GetString() : null,
            PostalCity = body.TryGetProperty("address1_city", out var pci) ? pci.GetString() : null,
            PostalCountry = body.TryGetProperty("address1_country", out var pco) ? pco.GetString() : null,
            Email = body.TryGetProperty("emailaddress1", out var em) ? em.GetString() : null,
            Phone = body.TryGetProperty("telephone1", out var ph) ? ph.GetString() : null,
            CreatedOn = DateTime.UtcNow,
            ModifiedOn = DateTime.UtcNow,
        };

        if (account.OrganisationTypeId.HasValue && InMemoryStore.OrgTypes.TryGetValue(account.OrganisationTypeId.Value, out var orgType))
        {
            account.OrganisationTypeName = orgType.Name;
        }

        InMemoryStore.Accounts[id] = account;

        Response.Headers["OData-EntityId"] = $"accounts({id})";
        return Created($"accounts({id})", account);
    }

    [HttpPatch("{id}")]
    public IActionResult Update(Guid id, [FromBody] JsonElement body)
    {
        if (!InMemoryStore.Accounts.TryGetValue(id, out var account))
            return NotFound();

        if (body.TryGetProperty("name", out var n)) account.Name = n.GetString()!;
        if (body.TryGetProperty("spsm_orgnumber", out var o)) account.OrgNumber = o.GetString();
        if (body.TryGetProperty("statecode", out var sc)) account.StateCode = sc.GetInt32();
        if (body.TryGetProperty("statuscode", out var stc)) account.StatusCode = stc.GetInt32();
        if (body.TryGetProperty("spsm_sourcetype", out var st)) account.SourceType = st.GetInt32();
        if (body.TryGetProperty("address1_line1", out var ps)) account.PostalStreet = ps.GetString();
        if (body.TryGetProperty("address1_postalcode", out var pc)) account.PostalCode = pc.GetString();
        if (body.TryGetProperty("address1_city", out var pci)) account.PostalCity = pci.GetString();
        if (body.TryGetProperty("emailaddress1", out var em)) account.Email = em.GetString();
        if (body.TryGetProperty("telephone1", out var ph)) account.Phone = ph.GetString();
        account.ModifiedOn = DateTime.UtcNow;

        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        return InMemoryStore.Accounts.TryRemove(id, out _) ? NoContent() : NotFound();
    }
}
