@echo off
echo Backend baslatiliyor...
start "Odelink Backend" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 5 /nobreak

echo Frontend baslatiliyor...
start "Odelink Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

timeout /t 10 /nobreak

echo Tarayici aciliyor...
start http://localhost:3000

echo.
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Pencereleri kapatmayin!
pause
