@echo off
echo ==========================================
echo    Graphite Gallery - Local Preview
echo ==========================================
echo.
echo Starting the local server...
echo Once started, the website will open automatically.
echo.

:: Start the browser in a new window after 3 seconds
start "" http://localhost:3000

:: Run the development server
npm run dev

pause
