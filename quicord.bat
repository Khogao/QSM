@echo off
chcp 65001 >nul
title Quicord v3.0 - Quick OCR Documents

echo.
echo ════════════════════════════════════════════════════════════════
echo  📄 Quicord v3.0 - Quick OCR Documents
echo  🇻🇳 Vietnamese Document Intelligence with AI
echo ════════════════════════════════════════════════════════════════
echo  Windows 11 Edition
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if venv exists
if not exist "python\venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found!
    echo.
    echo 📦 Please install dependencies first:
    echo    1. cd python
    echo    2. python -m venv venv
    echo    3. venv\Scripts\activate
    echo    4. pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo [*] Starting Quicord OCR engine...
echo.

REM Set UTF-8 encoding
set PYTHONIOENCODING=utf-8

REM Run Python script
python\venv\Scripts\python.exe ocr_complete.py

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Quicord finished
pause
