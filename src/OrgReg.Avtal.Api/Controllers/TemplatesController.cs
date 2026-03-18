using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgReg.Avtal.Api.Data;
using OrgReg.Shared.DTOs.Avtal;
using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Avtal.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class TemplatesController : ControllerBase
{
    private readonly AvtalDbContext _db;

    public TemplatesController(AvtalDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var templates = await _db.Templates
            .OrderBy(t => t.Name)
            .Select(t => new TemplateDto(t.Id, t.Name, t.Content, t.CreatedAt))
            .ToListAsync();
        return Ok(templates);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var template = await _db.Templates.FindAsync(id);
        if (template == null) return NotFound();
        return Ok(new TemplateDto(template.Id, template.Name, template.Content, template.CreatedAt));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TemplateCreateDto dto)
    {
        var template = new Template
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Content = dto.Content
        };
        _db.Templates.Add(template);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = template.Id },
            new TemplateDto(template.Id, template.Name, template.Content, template.CreatedAt));
    }
}
