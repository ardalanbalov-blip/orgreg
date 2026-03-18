FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/OrgReg.Organisation.Api/OrgReg.Organisation.Api.csproj OrgReg.Organisation.Api/
COPY src/OrgReg.Shared/OrgReg.Shared.csproj OrgReg.Shared/
COPY src/OrgReg.Dynamics/OrgReg.Dynamics.csproj OrgReg.Dynamics/
COPY src/OrgReg.Integrations/OrgReg.Integrations.csproj OrgReg.Integrations/
RUN dotnet restore "OrgReg.Organisation.Api/OrgReg.Organisation.Api.csproj"
COPY src/ .
WORKDIR "/src/OrgReg.Organisation.Api"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OrgReg.Organisation.Api.dll"]
