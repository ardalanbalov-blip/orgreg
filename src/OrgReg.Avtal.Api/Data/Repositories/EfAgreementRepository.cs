using Microsoft.EntityFrameworkCore;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Avtal.Api.Data.Repositories;

public class EfAgreementRepository : IAgreementRepository
{
    private readonly AvtalDbContext _db;

    public EfAgreementRepository(AvtalDbContext db)
    {
        _db = db;
    }

    public async Task<Agreement?> GetByIdAsync(Guid id)
    {
        return await _db.Agreements
            .Include(a => a.AgreementType)
            .Include(a => a.Validity)
            .Include(a => a.Template)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IReadOnlyList<Agreement>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        return await _db.Agreements
            .Include(a => a.AgreementType)
            .Include(a => a.Validity)
            .Include(a => a.Template)
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Agreement>> GetByOrganisationIdAsync(Guid organisationId)
    {
        return await _db.Agreements
            .Include(a => a.AgreementType)
            .Include(a => a.Validity)
            .Include(a => a.Template)
            .Where(a => a.OrganisationId == organisationId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Agreement> CreateAsync(Agreement agreement)
    {
        _db.Agreements.Add(agreement);
        await _db.SaveChangesAsync();
        return agreement;
    }

    public async Task<Agreement> UpdateAsync(Agreement agreement)
    {
        agreement.UpdatedAt = DateTime.UtcNow;
        _db.Agreements.Update(agreement);
        await _db.SaveChangesAsync();
        return agreement;
    }

    public async Task DeleteAsync(Guid id)
    {
        var agreement = await _db.Agreements.FindAsync(id);
        if (agreement != null)
        {
            _db.Agreements.Remove(agreement);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<int> CountAsync()
    {
        return await _db.Agreements.CountAsync();
    }
}
