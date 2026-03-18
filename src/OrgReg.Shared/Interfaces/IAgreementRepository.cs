using OrgReg.Shared.Models.Avtal;

namespace OrgReg.Shared.Interfaces;

public interface IAgreementRepository
{
    Task<Agreement?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Agreement>> GetAllAsync(int page = 1, int pageSize = 50);
    Task<IReadOnlyList<Agreement>> GetByOrganisationIdAsync(Guid organisationId);
    Task<Agreement> CreateAsync(Agreement agreement);
    Task<Agreement> UpdateAsync(Agreement agreement);
    Task DeleteAsync(Guid id);
    Task<int> CountAsync();
}

public interface IAgreementTypeRepository
{
    Task<AgreementType?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<AgreementType>> GetAllAsync();
    Task<AgreementType> CreateAsync(AgreementType type);
}

public interface ITemplateRepository
{
    Task<Template?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Template>> GetAllAsync();
    Task<Template> CreateAsync(Template template);
    Task<Template> UpdateAsync(Template template);
}
