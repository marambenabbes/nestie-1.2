@echo off
echo ================================================
echo  Testing Ultrasound AI Analysis
echo ================================================

echo.
echo This script will test the ultrasound AI analysis endpoint
echo.

REM Test data - week 20 with normal measurements
set TEST_DATA={"pregnancy_week": 20, "weight_grams": 310, "length_cm": 16.5, "head_circumference_cm": 4.8, "femur_length_cm": 3.5, "abdominal_circumference_cm": 15.0, "heart_rate": 145}

echo Testing AI Service endpoint...
echo POST http://localhost:8000/api/ai/ultrasound/analyze-smart
echo.

curl -X POST "http://localhost:8000/api/ai/ultrasound/analyze-smart" ^
  -H "Content-Type: application/json" ^
  -d "%TEST_DATA%"

echo.
echo.
echo ================================================
echo Test complete!
echo.
echo If you see a JSON response with "overall_status", 
echo "measurements_analysis", and "recommendations",
echo the AI analysis is working correctly!
echo ================================================
pause
