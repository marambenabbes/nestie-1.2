"""Symptom analysis router — anomaly detection for pregnancy symptoms."""

import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Known critical symptom patterns by trimester
CRITICAL_SYMPTOMS = {
    1: ["heavy bleeding", "severe abdominal pain", "high fever", "fainting"],
    2: ["vaginal bleeding", "severe headache", "vision changes", "swelling of face", "reduced fetal movement"],
    3: ["vaginal bleeding", "severe headache", "blurred vision", "sudden swelling", "contractions before 37 weeks",
        "fluid leaking", "decreased fetal movement", "severe abdominal pain"],
}

COMMON_SYMPTOMS = {
    1: ["nausea", "fatigue", "breast tenderness", "mild cramping", "mood changes", "food aversions"],
    2: ["back pain", "round ligament pain", "heartburn", "nasal congestion", "leg cramps", "dizziness"],
    3: ["braxton hicks", "insomnia", "shortness of breath", "swollen feet", "frequent urination", "pelvic pressure"],
}


class SymptomInput(BaseModel):
    symptom_name: str
    severity: str  # MILD, MODERATE, SEVERE, CRITICAL
    description: str | None = None
    pregnancy_week: int
    duration_hours: float | None = None


class SymptomAnalysis(BaseModel):
    is_anomalous: bool
    urgency_level: str  # NORMAL, WATCH, URGENT, EMERGENCY
    explanation: str
    recommendation: str
    related_conditions: list[str]


@router.post("/analyze", response_model=SymptomAnalysis)
async def analyze_symptom(data: SymptomInput):
    """Analyze a pregnancy symptom for anomalies and provide recommendations."""
    trimester = _get_trimester(data.pregnancy_week)
    symptom_lower = data.symptom_name.lower()
    desc_lower = (data.description or "").lower()
    combined = f"{symptom_lower} {desc_lower}"

    # Check against critical symptoms
    is_critical = any(cs in combined for cs in CRITICAL_SYMPTOMS.get(trimester, []))
    is_common = any(cs in combined for cs in COMMON_SYMPTOMS.get(trimester, []))
    is_severe = data.severity in ("SEVERE", "CRITICAL")

    # Determine anomaly and urgency
    if is_critical or (is_severe and not is_common):
        is_anomalous = True
        urgency = "EMERGENCY" if data.severity == "CRITICAL" else "URGENT"
    elif is_severe:
        is_anomalous = True
        urgency = "URGENT"
    elif not is_common and data.severity == "MODERATE":
        is_anomalous = True
        urgency = "WATCH"
    else:
        is_anomalous = False
        urgency = "NORMAL"

    explanation = _build_explanation(data, trimester, is_common, is_critical)
    recommendation = _build_recommendation(urgency)
    conditions = _get_related_conditions(combined, trimester)

    return SymptomAnalysis(
        is_anomalous=is_anomalous,
        urgency_level=urgency,
        explanation=explanation,
        recommendation=recommendation,
        related_conditions=conditions,
    )


def _get_trimester(week: int) -> int:
    if week <= 12: return 1
    if week <= 27: return 2
    return 3


def _build_explanation(data: SymptomInput, trimester: int, is_common: bool, is_critical: bool) -> str:
    if is_critical:
        return f"⚠️ '{data.symptom_name}' at week {data.pregnancy_week} (trimester {trimester}) is flagged as a potentially critical symptom that requires immediate medical attention."
    if is_common:
        return f"'{data.symptom_name}' is a commonly reported symptom during trimester {trimester}. Severity level: {data.severity}."
    return f"'{data.symptom_name}' is not typically expected at week {data.pregnancy_week}. It may warrant further evaluation."


def _build_recommendation(urgency: str) -> str:
    recs = {
        "EMERGENCY": "🚨 Seek immediate medical attention. Call your healthcare provider or go to the nearest emergency room.",
        "URGENT": "📞 Contact your healthcare provider as soon as possible for evaluation.",
        "WATCH": "📝 Monitor the symptom closely. If it worsens or persists beyond 24 hours, contact your provider.",
        "NORMAL": "✅ This appears to be a normal pregnancy symptom. Rest and stay hydrated. Mention it at your next prenatal visit.",
    }
    return recs.get(urgency, recs["NORMAL"])


def _get_related_conditions(text: str, trimester: int) -> list[str]:
    conditions = []
    if any(w in text for w in ["headache", "vision", "swelling", "blood pressure"]):
        conditions.append("Preeclampsia")
    if any(w in text for w in ["bleeding", "spotting", "cramp"]):
        conditions.append("Ectopic pregnancy" if trimester == 1 else "Placenta previa")
    if any(w in text for w in ["sugar", "thirst", "urination"]):
        conditions.append("Gestational diabetes")
    if "fever" in text:
        conditions.append("Infection")
    return conditions or ["No specific conditions flagged"]
