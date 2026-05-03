@echo off
echo Backend baslatiliyor...
start "Odelink Backend" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 5 /nobreak

echo Nova Tema baslatiliyor (Port 3001)...
start "Odelink Nova Theme" cmd /k "cd /d "%~dp0backend\themes\Nova" && npm run dev -- -p 3001"

timeout /t 5 /nobreak

echo Platform (Site Builder) baslatiliyor (Port 3002)...
start "Odelink Platform" cmd /k "cd /d "%~dp0platform" && npm run dev -- -p 3002"

timeout /t 5 /nobreak

echo Frontend (Dashboard) baslatiliyor (Port 3000)...
start "Odelink Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

timeout /t 10 /nobreak

echo Tarayici aciliyor...
start http://localhost:3000

echo.
echo ========================================
echo Dashboard: http://localhost:3000
echo Backend:   http://localhost:5000
echo Nova Tema: http://localhost:3001
echo Platform:  http://localhost:3002
echo ========================================
echo.
echo Pencereleri kapatmayin!
pause
