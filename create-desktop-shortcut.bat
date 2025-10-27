@echo off
REM QSM OCR Desktop Shortcut Creator

echo Creating desktop shortcut for QSM OCR...

set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=%DESKTOP%\QSM OCR.lnk

REM Create VBS script to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%SHORTCUT%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_DIR%ocr-quick.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "QSM - OCR Image to Word/PDF/EPUB" >> CreateShortcut.vbs
echo oLink.IconLocation = "%SystemRoot%\System32\shell32.dll,265" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Run VBS script
cscript CreateShortcut.vbs

REM Cleanup
del CreateShortcut.vbs

echo.
echo SUCCESS! Desktop shortcut created.
echo You can now double-click "QSM OCR" on your desktop.
echo.
pause
