@echo off
REM ========================================
REM 🖼️ OCR Images to Document - Quick Run
REM ========================================

title OCR Images to Document - QSM

echo.
echo ========================================
echo 🖼️  OCR Images to Document
echo ========================================
echo.

REM Change to QSM directory
cd /d "%~dp0"

REM Activate Python venv
call python\venv\Scripts\activate.bat

REM Run OCR script
python ocr-images-to-doc.py

REM Deactivate venv
deactivate

pause
