@echo off
echo ==========================================
echo    Graphite Gallery - Website Updater
echo ==========================================
echo.

cd /d "%~dp0"

echo Adding all changes...
git add -A

echo.
set /p MSG="Enter a short description (or press Enter for default): "
if "%MSG%"=="" set MSG=Updated gallery images

echo.
echo Committing changes...
git commit -m "%MSG%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo    Done! Your website is now updated.
echo ==========================================
echo.
pause
