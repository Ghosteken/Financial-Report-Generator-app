using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;
using ReportServer;

var builder = WebApplication.CreateBuilder(args);

// local testing from the frontend server
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
    {
        policy.WithOrigins("http://localhost:8080", "http://127.0.0.1:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Serve static files from wwwroot if present (used when frontend is bundled with the API)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("LocalDev");

app.MapPost("/reports", async (HttpRequest req) =>
{
    try
    {
        var model = await req.ReadFromJsonAsync<ReportRequest>();
        if (model == null)
            return Results.BadRequest(new { error = "Invalid payload" });

        // validation
        if (string.IsNullOrWhiteSpace(model.Client) || string.IsNullOrWhiteSpace(model.ReportType))
            return Results.BadRequest(new { error = "client and reportType required" });

        // unique filename per request
        var id = Guid.NewGuid().ToString("N");
        var outFile = Path.Combine(Directory.GetCurrentDirectory(), $"GeneratedReport_{id}.docx");

        ReportGenerator.CreateSimpleReport(model.Client, model.ReportType, outFile);
        if (File.Exists(outFile))
        {
            var url = $"/files/{Path.GetFileName(outFile)}";
            return Results.Ok(new { file = url, fileName = Path.GetFileName(outFile) });
        }

        return Results.StatusCode(500);
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
});

// endpoint to download created reports
var filesDir = Directory.GetCurrentDirectory();
app.MapGet("/files/{name}", (string name) =>
{
    var file = Path.Combine(filesDir, name);
    if (!File.Exists(file)) return Results.NotFound();
    var stream = File.OpenRead(file);
    return Results.File(stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", name);
});

// Fallback to index.html for SPA routes if index exists in wwwroot
app.MapFallback(() =>
{
    var indexPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
    if (File.Exists(indexPath)) return Results.File(indexPath, "text/html");
    return Results.NotFound();
});

app.Run();

public class ReportRequest
{
    public string? ReportType { get; set; }
    public int? ReportingYear { get; set; }
    public string? Client { get; set; }
    public string? RequestedAt { get; set; }
}
