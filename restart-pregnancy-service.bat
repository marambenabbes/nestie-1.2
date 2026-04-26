@echo off
echo ================================================
echo  Restarting Pregnancy Service
echo ================================================

echo [1/2] Stopping Pregnancy Service (port 8082)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8082" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/2] Starting Pregnancy Service...
cd pregnancy-service\target
start "Pregnancy Service (8082)" cmd /k "java -jar pregnancy-service-1.0.0.jar"
cd ..\..

echo ================================================
echo Pregnancy Service restarted!
echo Check the new window for logs.
echo ================================================
pause
