using Microsoft.EntityFrameworkCore;
using OrgReg.Avtal.Api.Data;
using OrgReg.Avtal.Api.Data.Repositories;
using OrgReg.Avtal.Api.Services;
using OrgReg.Shared.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SPSM Avtal API", Version = "v1" });
});

builder.Services.AddDbContext<AvtalDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AvtalDb")));

builder.Services.AddScoped<IAgreementRepository, EfAgreementRepository>();
builder.Services.AddScoped<AgreementService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>())
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AvtalDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
