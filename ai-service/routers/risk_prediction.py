"""Risk prediction router — ML-based pregnancy risk assessment."""

from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()


class RiskInput(BaseModel):
    age: int
    bmi: float
    pregnancy_week: int
    blood_pressure_systolic: float
    blood_pressure_diastolic: float
    blood_sugar: float
    previous_complications: int = 0
    has_diabetes: bool = False
    has_hypertension: bool = False


class RiskOutput(BaseModel):
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_score: float
    risk_factors: list[str]
    recommendations: list[str]


@router.post("/predict", response_model=RiskOutput)
async def predict_risk(data: RiskInput):
    """Predict pregnancy risk level based on health parameters."""
    risk_factors = []
    score = 0.0

    # Age risk
    if data.age < 18:
        score += 15; risk_factors.append("Teenage pregnancy (under 18)")
    elif data.age > 35:
        score += 20; risk_factors.append("Advanced maternal age (over 35)")

    # BMI risk
    if data.bmi < 18.5:
        score += 10; risk_factors.append("Underweight (BMI < 18.5)")
    elif data.bmi > 30:
        score += 15; risk_factors.append("Obesity (BMI > 30)")
    elif data.bmi > 25:
        score += 5; risk_factors.append("Overweight (BMI 25-30)")

    # Blood pressure
    if data.blood_pressure_systolic > 140 or data.blood_pressure_diastolic > 90:
        score += 25; risk_factors.append("High blood pressure (hypertension)")
    elif data.blood_pressure_systolic > 130 or data.blood_pressure_diastolic > 85:
        score += 10; risk_factors.append("Elevated blood pressure")

    # Blood sugar
    if data.blood_sugar > 126:
        score += 20; risk_factors.append("High blood sugar — possible gestational diabetes")
    elif data.blood_sugar > 100:
        score += 8; risk_factors.append("Slightly elevated blood sugar")

    # History
    if data.previous_complications > 0:
        score += 15 * min(data.previous_complications, 3)
        risk_factors.append(f"History of {data.previous_complications} previous complication(s)")
    if data.has_diabetes:
        score += 15; risk_factors.append("Pre-existing diabetes")
    if data.has_hypertension:
        score += 15; risk_factors.append("Pre-existing hypertension")

    # Normalize score
    score = min(score, 100)

    # Determine level
    if score >= 70:
        level = "CRITICAL"
    elif score >= 45:
        level = "HIGH"
    elif score >= 20:
        level = "MODERATE"
    else:
        level = "LOW"

    recommendations = _get_recommendations(level, risk_factors)

    return RiskOutput(
        risk_level=level,
        risk_score=round(score, 1),
        risk_factors=risk_factors or ["No significant risk factors detected"],
        recommendations=recommendations,
    )


def _get_recommendations(level: str, factors: list[str]) -> list[str]:
    recs = ["Continue regular prenatal visits", "Maintain a balanced diet rich in folic acid and iron"]
    if level in ("HIGH", "CRITICAL"):
        recs.insert(0, "⚠️ Consult your healthcare provider immediately")
        recs.append("Consider more frequent monitoring")
    if any("blood pressure" in f.lower() for f in factors):
        recs.append("Monitor blood pressure daily")
        recs.append("Reduce sodium intake")
    if any("blood sugar" in f.lower() or "diabetes" in f.lower() for f in factors):
        recs.append("Monitor blood glucose levels regularly")
        recs.append("Follow a gestational diabetes diet plan")
    if any("bmi" in f.lower() or "overweight" in f.lower() or "obesity" in f.lower() for f in factors):
        recs.append("Engage in moderate exercise (walking, prenatal yoga)")
    return recs
