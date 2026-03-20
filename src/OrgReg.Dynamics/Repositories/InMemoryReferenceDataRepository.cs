using System.Collections.Concurrent;
using OrgReg.Shared.Interfaces;
using OrgReg.Shared.Models.Organisation;

namespace OrgReg.Dynamics.Repositories;

public class InMemoryReferenceDataRepository : IReferenceDataRepository
{
    private static readonly ConcurrentDictionary<Guid, OrganisationType> _orgTypes = new();
    private static readonly ConcurrentDictionary<Guid, UnitType> _unitTypes = new();
    private static readonly ConcurrentDictionary<Guid, EducationType> _eduTypes = new();

    static InMemoryReferenceDataRepository()
    {
        // Organisation types (matching FakeDynamics)
        SeedOrgType("c1000000-0000-0000-0000-000000000001", "Kommun", "Kommunal huvudman");
        SeedOrgType("c1000000-0000-0000-0000-000000000002", "Fristående huvudman", "Fristående skolhuvudman");
        SeedOrgType("c1000000-0000-0000-0000-000000000003", "Statlig", "Statlig myndighet");
        SeedOrgType("c1000000-0000-0000-0000-000000000004", "Övrig", "Övrig organisationstyp");

        // Unit types
        SeedUnitType("u1000000-0000-0000-0000-000000000001", "Grundskola", "Grundskola (åk 1–9)");
        SeedUnitType("u1000000-0000-0000-0000-000000000002", "Gymnasieskola", "Gymnasieskola (åk 1–3)");
        SeedUnitType("u1000000-0000-0000-0000-000000000003", "Förskola", "Förskoleverksamhet");
        SeedUnitType("u1000000-0000-0000-0000-000000000004", "Specialskola", "Specialskola enligt skollagen");
        SeedUnitType("u1000000-0000-0000-0000-000000000005", "Särskola", "Anpassad grundskola");
        SeedUnitType("u1000000-0000-0000-0000-000000000006", "Fritidshem", "Fritidshemsverksamhet");
        SeedUnitType("u1000000-0000-0000-0000-000000000007", "Vuxenutbildning", "Kommunal vuxenutbildning");

        // Education types (SS12000)
        SeedEduType("d1000000-0000-0000-0000-000000000001", "Grundskola", "GR", "Grundskoleutbildning");
        SeedEduType("d1000000-0000-0000-0000-000000000002", "Gymnasieskola", "GY", "Gymnasieutbildning");
        SeedEduType("d1000000-0000-0000-0000-000000000003", "Förskola", "FS", "Förskoleutbildning");
        SeedEduType("d1000000-0000-0000-0000-000000000004", "Specialskola", "SP", "Specialskoleutbildning");
        SeedEduType("d1000000-0000-0000-0000-000000000005", "Anpassad grundskola", "AS", "Anpassad grundskoleutbildning");
        SeedEduType("d1000000-0000-0000-0000-000000000006", "Fritidshem", "FH", "Fritidshemsverksamhet");
        SeedEduType("d1000000-0000-0000-0000-000000000007", "Komvux", "KV", "Kommunal vuxenutbildning");
    }

    private static void SeedOrgType(string id, string name, string desc)
    {
        var guid = Guid.Parse(id);
        _orgTypes[guid] = new OrganisationType { Id = guid, Name = name, Description = desc };
    }

    private static void SeedUnitType(string id, string name, string desc)
    {
        var guid = Guid.Parse(id);
        _unitTypes[guid] = new UnitType { Id = guid, Name = name, Description = desc };
    }

    private static void SeedEduType(string id, string name, string code, string desc)
    {
        var guid = Guid.Parse(id);
        _eduTypes[guid] = new EducationType { Id = guid, Name = name, Code = code, Description = desc };
    }

    public Task<IReadOnlyList<OrganisationType>> GetOrganisationTypesAsync()
        => Task.FromResult<IReadOnlyList<OrganisationType>>(_orgTypes.Values.OrderBy(t => t.Name).ToList());

    public Task<IReadOnlyList<UnitType>> GetUnitTypesAsync()
        => Task.FromResult<IReadOnlyList<UnitType>>(_unitTypes.Values.OrderBy(t => t.Name).ToList());

    public Task<IReadOnlyList<EducationType>> GetEducationTypesAsync()
        => Task.FromResult<IReadOnlyList<EducationType>>(_eduTypes.Values.OrderBy(t => t.Name).ToList());
}
