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
    Start-Process -NoNewWindow -FilePath $backendBin -WorkingDirectory $backend
}

# ── Frontend ─────────────────────────────────────────────────────────────
Write-Host "[Frontend] Installing dependencies..." -ForegroundColor Green
Push-Location $frontend
npm install --silent
Write-Host "[Frontend] Starting Vite dev server on port 5173..." -ForegroundColor Green
Write-Host "`n  Open: http://localhost:5173`n" -ForegroundColor Cyan
npm run dev
Pop-Location
