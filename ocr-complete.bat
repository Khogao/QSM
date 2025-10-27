@echo off
chcp 65001 >nul
title QSM OCR Complete - Images + PDFs

echo.
echo ════════════════════════════════════════════════════════════════
echo  QSM OCR Complete
echo  OCR for Images (JPG/PNG/BMP/TIFF) + PDFs (scanned)
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if venv exists
if not exist "python\venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found!
    echo Please run: cd python ^&^& python -m venv venv
    echo Then install: pip install -r requirements.txt
    pause
    exit /b 1
)

echo [*] Starting OCR engine...
echo.

REM Run Python script
python\venv\Scripts\python.exe ocr_complete.py

echo.
echo ════════════════════════════════════════════════════════════════
pause
