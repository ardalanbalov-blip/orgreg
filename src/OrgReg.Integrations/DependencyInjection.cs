using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OrgReg.Integrations.Skolenhetsregistret;
using OrgReg.Integrations.Statistikdatabasen;

namespace OrgReg.Integrations;

public static class DependencyInjection
{
    public static IServiceCollection AddExternalIntegrations(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient<SkolenhetsregistretClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["Integrations:Skolenhetsregistret:BaseUrl"] ?? "https://api.skolverket.se/");
        });

        services.AddHttpClient<StatistikdatabasenClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["Integrations:Statistikdatabasen:BaseUrl"] ?? "https://api.statistikdatabasen.se/");
        });

        return services;
    }
}
