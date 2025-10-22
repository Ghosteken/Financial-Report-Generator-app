# Start ASP.NET Core API in a new PowerShell window
$apiPath = Join-Path $PSScriptRoot 'server\Api'
Write-Host "Starting API from $apiPath"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$apiPath'; dotnet run --urls http://localhost:5000" 
