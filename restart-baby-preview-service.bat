@echo off
echo Restarting Baby Preview Service with new HF token...

REM Set the new Hugging Face API token
set HF_API_TOKEN=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

echo Stopping Baby Preview Service if running...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8084" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo Starting Baby Preview Service on port 8084...
cd baby-preview-service\target
start "Baby Preview Service (8084)" cmd /k "set HF_API_TOKEN=%HF_API_TOKEN% && java -jar baby-preview-service-0.0.1-SNAPSHOT.jar"
cd ..\..

echo Baby Preview Service restarted with new token!
echo Check the new window for logs.
pause
