@echo off
echo Stopping AI service if running...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq AI Service*" 2>nul
timeout /t 2 /nobreak >nul

echo Clearing Python cache...
if exist "ai-service\__pycache__" rmdir /s /q "ai-service\__pycache__"
if exist "ai-service\routers\__pycache__" rmdir /s /q "ai-service\routers\__pycache__"

echo Starting AI service...
cd ai-service
start "AI Service" cmd /k ".venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo AI service restarted!
echo Check the new window for logs.
pause
