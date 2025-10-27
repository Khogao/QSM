@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🎯 QSM - OCR Image to Word
echo ========================================
echo.

cd /d "%~dp0"

if not exist "python\venv\Scripts\python.exe" (
    echo ❌ Python venv not found!
    echo Please run: python -m venv python\venv
    pause
    exit /b 1
)

echo 🚀 Starting OCR converter...
echo.

python\venv\Scripts\python.exe ocr_image_to_word.py

pause
