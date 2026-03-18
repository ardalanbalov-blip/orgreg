FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OrgReg.Organisation.Api/OrgReg.Organisation.Api.csproj", "OrgReg.Organisation.Api/"]
COPY ["OrgReg.Shared/OrgReg.Shared.csproj", "OrgReg.Shared/"]
COPY ["OrgReg.Dynamics/OrgReg.Dynamics.csproj", "OrgReg.Dynamics/"]
RUN dotnet restore "OrgReg.Organisation.Api/OrgReg.Organisation.Api.csproj"
COPY . .
WORKDIR "/src/OrgReg.Organisation.Api"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OrgReg.Organisation.Api.dll"]
