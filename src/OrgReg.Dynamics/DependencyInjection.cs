using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OrgReg.Dynamics.Client;
using OrgReg.Dynamics.Repositories;
using OrgReg.Shared.Interfaces;

namespace OrgReg.Dynamics;

public static class DependencyInjection
{
    public static IServiceCollection AddDynamicsIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DynamicsClientOptions>(configuration.GetSection(DynamicsClientOptions.SectionName));

        services.AddHttpClient<DynamicsHttpClient>();

        services.AddScoped<IOrganisationRepository, DynamicsOrganisationRepository>();
        services.AddScoped<IUnitRepository, DynamicsUnitRepository>();

        return services;
    }
}
