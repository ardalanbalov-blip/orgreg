FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OrgReg.Avtal.Api/OrgReg.Avtal.Api.csproj", "OrgReg.Avtal.Api/"]
COPY ["OrgReg.Shared/OrgReg.Shared.csproj", "OrgReg.Shared/"]
RUN dotnet restore "OrgReg.Avtal.Api/OrgReg.Avtal.Api.csproj"
COPY . .
WORKDIR "/src/OrgReg.Avtal.Api"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OrgReg.Avtal.Api.dll"]
