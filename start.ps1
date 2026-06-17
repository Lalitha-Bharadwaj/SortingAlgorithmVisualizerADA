# AdaSortLab Startup Script
# Run both Ada backend and Vite frontend in parallel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AdaSortLab - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$backendBin = Join-Path $backend "bin\backend.exe"

# ── Check if backend binary exists ──────────────────────────────────────
if (-not (Test-Path $backendBin)) {
    Write-Host "`n[Backend] Building Ada server..." -ForegroundColor Yellow
    Push-Location $backend
    alr build
    Pop-Location
}

if (-not (Test-Path $backendBin)) {
    Write-Host "[ERROR] Backend binary not found at $backendBin" -ForegroundColor Red
    Write-Host "  Run: cd backend && alr build" -ForegroundColor Gray
    Write-Host "  Frontend will still start, but API calls will fail.`n" -ForegroundColor Gray
} else {
    Write-Host "[Backend] Starting Ada server on port 8080..." -ForegroundColor Green
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "& '$backendBin'" -WorkingDirectory $backend

    # Wait until backend is reachable
    Write-Host "[Backend] Waiting for backend to be ready..." -ForegroundColor Yellow
    $maxWait = 15; $waited = 0
    do {
        Start-Sleep -Seconds 1; $waited++
        try { $null = Invoke-RestMethod -Uri "http://localhost:8080/" -TimeoutSec 1 -ErrorAction Stop; break } catch {}
    } while ($waited -lt $maxWait)
    if ($waited -ge $maxWait) { Write-Host "[Backend] WARNING: backend may not be ready yet." -ForegroundColor Red }
    else { Write-Host "[Backend] Ready!" -ForegroundColor Green }
}

# ── Frontend ─────────────────────────────────────────────────────────────
Write-Host "[Frontend] Installing dependencies..." -ForegroundColor Green
Push-Location $frontend
npm install --silent
Write-Host "[Frontend] Starting Vite dev server on port 5173..." -ForegroundColor Green
Write-Host "`n  Open: http://localhost:5173`n" -ForegroundColor Cyan
npm run dev
Pop-Location
