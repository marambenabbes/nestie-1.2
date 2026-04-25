@echo off
echo ==============================================
echo        Nestie AI Service Starter (Maven)
echo ==============================================

echo Note: You requested to use mvn, but the mvn command
echo was not found in the global PATH. If you have it 
echo configured, these windows will start the servers.

echo Starting Frontend (Angular) on port 4200...
start "Frontend (4200)" cmd /k "cd frontend && npm start"

echo Starting API Gateway on port 9090...
start "Gateway Service (9090)" cmd /k "cd gateway-service && mvn spring-boot:run"

echo Starting AI Service (Python) on port 8000...
start "AI Service (8000)" cmd /k "cd ai-service && .venv\Scripts\uvicorn.exe main:app --port 8000"

echo Starting Auth Service on port 8081...
start "Auth Service (8081)" cmd /k "cd auth-service && mvn spring-boot:run"

echo Starting Pregnancy Service on port 8082...
start "Pregnancy Service (8082)" cmd /k "cd pregnancy-service && mvn spring-boot:run"

echo Starting Appointment Service on port 8083...
start "Appointment Service (8083)" cmd /k "cd appointment-service && mvn spring-boot:run"

echo Starting Baby Preview Service on port 8084...
start "Baby Preview Service (8084)" cmd /k "cd baby-preview-service && mvn spring-boot:run"

echo Starting Education Service on port 8085...
start "Education Service (8085)" cmd /k "cd education-service && mvn spring-boot:run"

echo ==============================================
echo All services have been launched in new windows!
echo MySQL is already running manually on 3307 as requested.
echo ==============================================
pause
