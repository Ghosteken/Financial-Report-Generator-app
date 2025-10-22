# static server for the frontend in a new PowerShell window
$root = $PSScriptRoot
Write-Host "Starting frontend from $root"

# Python's http.server if available
if (Get-Command python -ErrorAction SilentlyContinue) {
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root'; python -m http.server 8080"
} else {
    # Fallback: npx http-server if Node is available
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root'; npx http-server -c-1 -p 8080"
    } else {
        Write-Host "Neither python nor npx found. Please install Node or Python, or open index.html directly." -ForegroundColor Yellow
    }
}
