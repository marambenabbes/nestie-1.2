@echo off
echo ================================================
echo  Restarting AI Service + Baby Preview Service
echo ================================================

REM Set the new Hugging Face API token
set HF_API_TOKEN=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
set GEMINI_API_KEY=AIzaSyCYNmSi-aqXjgBQ_06u6xzp_hHrV6l7Guc

echo [1/4] Stopping AI Service (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Stopping Baby Preview Service (port 8084)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8084" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [3/4] Clearing Python cache...
if exist "ai-service\__pycache__" rmdir /s /q "ai-service\__pycache__"
if exist "ai-service\routers\__pycache__" rmdir /s /q "ai-service\routers\__pycache__"

echo [4/4] Starting services with new token...
cd ai-service
start "AI Service (8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

cd baby-preview-service\target
start "Baby Preview Service (8084)" cmd /k "set HF_API_TOKEN=%HF_API_TOKEN% && java -jar baby-preview-service-0.0.1-SNAPSHOT.jar"
cd ..\..

echo ================================================
echo Services restarted successfully!
echo - AI Service: http://localhost:8000
echo - Baby Preview: http://localhost:8084
echo Check the new windows for logs.
echo ================================================
pause
