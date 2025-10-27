# QSM - OCR Image to Word (PowerShell version)
# Quick OCR for images

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "QSM - OCR Image to Word" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Python venv
$pythonExe = Join-Path $PSScriptRoot "python\venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "[ERROR] Python venv not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv python\venv" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[*] Starting OCR converter..." -ForegroundColor Green
Write-Host ""

# Run Python script
& $pythonExe (Join-Path $PSScriptRoot "ocr_image_to_word.py")

Write-Host ""
Read-Host "Press Enter to exit"
