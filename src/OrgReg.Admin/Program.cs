var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("OrgApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiUrls:OrganisationApi"] ?? "http://localhost:5010");
});
builder.Services.AddHttpClient("AvtalApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiUrls:AvtalApi"] ?? "http://localhost:5011");
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// API proxy endpoints for the admin SPA
app.MapGet("/admin/api/organisations", async (IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("OrgApi");
    var resp = await client.GetAsync("/api/v1/organisations?pageSize=500");
    var content = await resp.Content.ReadAsStringAsync();
    return Results.Content(content, "application/json");
});

app.MapGet("/admin/api/organisations/{id}", async (Guid id, IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("OrgApi");
    var resp = await client.GetAsync($"/api/v1/organisations/{id}");
    var content = await resp.Content.ReadAsStringAsync();
    return resp.IsSuccessStatusCode ? Results.Content(content, "application/json") : Results.NotFound();
});

app.MapDelete("/admin/api/organisations/{id}", async (Guid id, IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("OrgApi");
    var resp = await client.DeleteAsync($"/api/v1/organisations/{id}");
    return resp.IsSuccessStatusCode ? Results.NoContent() : Results.NotFound();
});

app.MapPost("/admin/api/organisations/import", async (HttpRequest req, IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("OrgApi");
    using var reader = new StreamReader(req.Body);
    var json = await reader.ReadToEndAsync();
    var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
    var resp = await client.PostAsync("/api/v1/organisations", content);
    var result = await resp.Content.ReadAsStringAsync();
    return resp.IsSuccessStatusCode ? Results.Content(result, "application/json") : Results.BadRequest(result);
});

app.MapGet("/admin/api/agreements", async (IHttpClientFactory factory) =>
{
    var client = factory.CreateClient("AvtalApi");
    var resp = await client.GetAsync("/api/v1/agreements?pageSize=500");
    var content = await resp.Content.ReadAsStringAsync();
    return Results.Content(content, "application/json");
});

app.Run();
