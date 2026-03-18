FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OrgReg.FakeDynamics/OrgReg.FakeDynamics.csproj", "OrgReg.FakeDynamics/"]
COPY ["OrgReg.Shared/OrgReg.Shared.csproj", "OrgReg.Shared/"]
RUN dotnet restore "OrgReg.FakeDynamics/OrgReg.FakeDynamics.csproj"
COPY . .
WORKDIR "/src/OrgReg.FakeDynamics"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OrgReg.FakeDynamics.dll"]
