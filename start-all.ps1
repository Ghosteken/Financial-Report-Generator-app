# Start both API and frontend in separate PowerShell windows
Write-Host "Starting API and frontend..."

Start-Process powershell -ArgumentList '-NoExit', "-Command", "& '$PSScriptRoot\\start-api.ps1'"
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList '-NoExit', "-Command", "& '$PSScriptRoot\\start-frontend.ps1'"
