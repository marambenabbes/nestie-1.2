"""Ultrasound analysis router — AI insights for baby ultrasound (ecography) images using Gemini Vision."""

import os
import base64
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

# WHO Fetal Growth Standards (approximate averages)
GROWTH_STANDARDS = {
    # Week: {weight_grams, length_cm, head_circumference_cm, femur_length_cm, abdominal_circumference_cm}
    12: {"weight": 14, "length": 5.4, "head": 2.4, "femur": 0.8, "abdominal": 6.0},
    14: {"weight": 43, "length": 8.7, "head": 2.9, "femur": 1.5, "abdominal": 7.9},
    16: {"weight": 100, "length": 11.6, "head": 3.5, "femur": 2.2, "abdominal": 10.3},
    18: {"weight": 190, "length": 14.2, "head": 4.1, "femur": 2.8, "abdominal": 12.4},
    20: {"weight": 300, "length": 16.4, "head": 4.7, "femur": 3.4, "abdominal": 14.8},
    22: {"weight": 430, "length": 27.8, "head": 5.2, "femur": 3.9, "abdominal": 17.0},
    24: {"weight": 600, "length": 30.0, "head": 5.7, "femur": 4.4, "abdominal": 19.2},
    26: {"weight": 760, "length": 32.0, "head": 6.2, "femur": 4.8, "abdominal": 21.2},
    28: {"weight": 1000, "length": 35.6, "head": 6.6, "femur": 5.2, "abdominal": 23.2},
    30: {"weight": 1320, "length": 38.6, "head": 7.0, "femur": 5.6, "abdominal": 25.2},
    32: {"weight": 1700, "length": 41.1, "head": 7.4, "femur": 6.0, "abdominal": 27.2},
    34: {"weight": 2150, "length": 43.7, "head": 7.8, "femur": 6.4, "abdominal": 29.2},
    36: {"weight": 2600, "length": 46.2, "head": 8.2, "femur": 6.7, "abdominal": 31.2},
    38: {"weight": 3100, "length": 48.6, "head": 8.6, "femur": 7.0, "abdominal": 33.2},
    40: {"weight": 3500, "length": 50.7, "head": 9.0, "femur": 7.3, "abdominal": 35.0},
}

# Fruit/veg size comparisons
FRUIT_SIZE = {
    8: "a Raspberry 🫐", 10: "a Strawberry 🍓", 12: "a Lime 🍋",
    14: "a Lemon 🍋", 16: "an Avocado 🥑", 18: "a Bell Pepper 🫑",
    20: "a Banana 🍌", 22: "a Carrot 🥕", 24: "an Ear of Corn 🌽",
    26: "a Lettuce Head 🥬", 28: "an Eggplant 🍆", 30: "a Coconut 🥥",
    32: "a Pineapple 🍍", 34: "a Cantaloupe 🍈", 36: "Romaine Lettuce 🥬",
    38: "a Mini Watermelon 🍉", 40: "a Small Pumpkin 🎃",
}


class UltrasoundAnalysisRequest(BaseModel):
    pregnancy_week: int
    ultrasound_image_base64: str | None = None
    weight_grams: float | None = None
    length_cm: float | None = None
    head_circumference_cm: float | None = None
    femur_length_cm: float | None = None
    abdominal_circumference_cm: float | None = None
    heart_rate: float | None = None


class MeasurementAnalysis(BaseModel):
    measurement_name: str
    actual_value: float | None
    expected_value: float
    percentile: str
    status: str  # NORMAL, BELOW_AVERAGE, ABOVE_AVERAGE, CONCERN
    explanation: str


class UltrasoundAnalysisResponse(BaseModel):
    pregnancy_week: int
    fruit_comparison: str
    overall_status: str  # NORMAL, MONITOR, CONCERN
    overall_summary: str
    measurements_analysis: list[MeasurementAnalysis]
    image_analysis: str | None
    development_notes: str
    recommendations: list[str]
    heartbeat_status: str | None


def _get_closest_week(week: int) -> int:
    """Find the closest week in growth standards."""
    keys = sorted(GROWTH_STANDARDS.keys())
    return min(keys, key=lambda k: abs(k - week))


def _calculate_percentile(actual: float, expected: float) -> tuple[str, str]:
    """Calculate percentile and status based on deviation from expected."""
    if actual is None:
        return "N/A", "NOT_PROVIDED"
    
    deviation_percent = ((actual - expected) / expected) * 100
    
    if -10 <= deviation_percent <= 10:
        return "50th (Normal)", "NORMAL"
    elif -20 <= deviation_percent < -10:
        return "25th (Slightly Below)", "BELOW_AVERAGE"
    elif deviation_percent < -20:
        return "10th (Below Average)", "CONCERN"
    elif 10 < deviation_percent <= 20:
        return "75th (Slightly Above)", "ABOVE_AVERAGE"
    else:
        return "90th (Above Average)", "ABOVE_AVERAGE"


def _analyze_measurement(name: str, actual: float | None, expected: float, unit: str) -> MeasurementAnalysis:
    """Analyze a single measurement against standards."""
    percentile, status = _calculate_percentile(actual, expected)
    
    if actual is None:
        explanation = f"No {name.lower()} measurement provided."
    elif status == "NORMAL":
        explanation = f"✅ {name} is within normal range ({actual:.1f}{unit} vs expected {expected:.1f}{unit})."
    elif status == "BELOW_AVERAGE":
        explanation = f"⚠️ {name} is slightly below average ({actual:.1f}{unit} vs expected {expected:.1f}{unit}). Monitor at next visit."
    elif status == "CONCERN":
        explanation = f"🔴 {name} is significantly below expected ({actual:.1f}{unit} vs expected {expected:.1f}{unit}). Consult your doctor."
    else:  # ABOVE_AVERAGE
        explanation = f"📈 {name} is above average ({actual:.1f}{unit} vs expected {expected:.1f}{unit}). This is often normal but mention to your doctor."
    
    return MeasurementAnalysis(
        measurement_name=name,
        actual_value=actual,
        expected_value=expected,
        percentile=percentile,
        status=status,
        explanation=explanation
    )


def _analyze_heart_rate(heart_rate: float | None, week: int) -> str | None:
    """Analyze fetal heart rate."""
    if heart_rate is None:
        return None
    
    if week < 16:
        normal_range = (150, 170)
    elif week < 24:
        normal_range = (140, 160)
    elif week < 32:
        normal_range = (130, 150)
    else:
        normal_range = (110, 150)
    
    if normal_range[0] <= heart_rate <= normal_range[1]:
        return f"✅ Heart rate is normal ({heart_rate:.0f} BPM, expected {normal_range[0]}-{normal_range[1]} BPM)"
    elif heart_rate < normal_range[0]:
        return f"⚠️ Heart rate is below normal range ({heart_rate:.0f} BPM, expected {normal_range[0]}-{normal_range[1]} BPM). Consult your doctor."
    else:
        return f"⚠️ Heart rate is above normal range ({heart_rate:.0f} BPM, expected {normal_range[0]}-{normal_range[1]} BPM). Consult your doctor."


async def _analyze_ultrasound_image_with_gemini(image_base64: str, week: int) -> str:
    """Use Gemini Vision to analyze ultrasound image."""
    try:
        from google import genai
        
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your-gemini-api-key-here":
            return "⚠️ Gemini API key not configured. Image analysis unavailable."
        
        client = genai.Client(api_key=api_key)
        
        # Strip data URI prefix if present
        if "," in image_base64 and image_base64.lower().startswith("data:"):
            image_base64 = image_base64.split(",", 1)[1]
        
        prompt = f"""You are an expert obstetrician analyzing a fetal ultrasound image at week {week} of pregnancy.

Analyze this ultrasound image and provide:
1. **Image Quality**: Is the image clear enough for analysis?
2. **Visible Structures**: What fetal structures can you identify (head, limbs, spine, heart, etc.)?
3. **Position**: What is the fetal position (head down, breech, transverse)?
4. **Development**: Any notable developmental features visible for week {week}?
5. **Concerns**: Any visible abnormalities or concerns? (Be cautious and professional)
6. **Reassurance**: Provide warm, supportive feedback for the expecting mother.

Keep your response concise (under 200 words), warm, and professional. Use emojis sparingly (🌸💕). 
If the image is not a clear ultrasound, politely mention that."""

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"),
            contents=[
                prompt,
                {"mime_type": "image/jpeg", "data": image_base64}
            ]
        )
        
        return (response.text or "Unable to analyze image").strip()
    
    except Exception as e:
        logger.error(f"Gemini image analysis failed: {e}")
        return f"⚠️ Image analysis unavailable: {str(e)[:100]}"


@router.post("/ultrasound/analyze-smart", response_model=UltrasoundAnalysisResponse)
async def analyze_ultrasound_smart(data: UltrasoundAnalysisRequest):
    """
    Intelligent ultrasound analysis using:
    - WHO fetal growth standards
    - Gemini Vision AI for image analysis
    - Percentile calculations
    - Clinical recommendations
    """
    week = data.pregnancy_week
    closest_week = _get_closest_week(week)
    standards = GROWTH_STANDARDS[closest_week]
    
    # Analyze each measurement
    measurements = []
    concern_count = 0
    
    if data.weight_grams is not None:
        analysis = _analyze_measurement("Weight", data.weight_grams, standards["weight"], "g")
        measurements.append(analysis)
        if analysis.status == "CONCERN":
            concern_count += 1
    
    if data.length_cm is not None:
        analysis = _analyze_measurement("Length", data.length_cm, standards["length"], "cm")
        measurements.append(analysis)
        if analysis.status == "CONCERN":
            concern_count += 1
    
    if data.head_circumference_cm is not None:
        analysis = _analyze_measurement("Head Circumference", data.head_circumference_cm, standards["head"], "cm")
        measurements.append(analysis)
        if analysis.status == "CONCERN":
            concern_count += 1
    
    if data.femur_length_cm is not None:
        analysis = _analyze_measurement("Femur Length", data.femur_length_cm, standards["femur"], "cm")
        measurements.append(analysis)
        if analysis.status == "CONCERN":
            concern_count += 1
    
    if data.abdominal_circumference_cm is not None:
        analysis = _analyze_measurement("Abdominal Circumference", data.abdominal_circumference_cm, standards["abdominal"], "cm")
        measurements.append(analysis)
        if analysis.status == "CONCERN":
            concern_count += 1
    
    # Determine overall status
    if concern_count >= 2:
        overall_status = "CONCERN"
        overall_summary = "⚠️ Multiple measurements are outside normal range. Please consult your healthcare provider for a detailed evaluation."
    elif concern_count == 1:
        overall_status = "MONITOR"
        overall_summary = "📋 One measurement needs monitoring. Discuss with your doctor at your next visit."
    else:
        overall_status = "NORMAL"
        overall_summary = "✅ All measurements are within normal ranges! Your baby is developing beautifully. 🌸"
    
    # Heart rate analysis
    heartbeat_status = _analyze_heart_rate(data.heart_rate, week)
    
    # Image analysis with Gemini
    image_analysis = None
    if data.ultrasound_image_base64:
        image_analysis = await _analyze_ultrasound_image_with_gemini(data.ultrasound_image_base64, week)
    
    # Fruit comparison
    fruit_keys = sorted(FRUIT_SIZE.keys())
    fruit_week = min(fruit_keys, key=lambda k: abs(k - week))
    fruit = FRUIT_SIZE[fruit_week]
    
    # Development notes
    if week < 16:
        development = "Early development phase — organs are forming rapidly. 🌱"
    elif week < 24:
        development = "Active growth phase — baby is moving and developing senses. 💫"
    elif week < 32:
        development = "Maturation phase — lungs and brain are developing quickly. 🧠"
    else:
        development = "Final preparation phase — baby is getting ready for birth! 🎀"
    
    # Recommendations
    recommendations = []
    if overall_status == "CONCERN":
        recommendations.append("Schedule a follow-up ultrasound with your doctor")
        recommendations.append("Discuss any concerns about fetal growth")
        recommendations.append("Ensure proper nutrition and prenatal vitamin intake")
    elif overall_status == "MONITOR":
        recommendations.append("Mention the flagged measurement at your next prenatal visit")
        recommendations.append("Continue regular prenatal care")
    else:
        recommendations.append("Continue your current prenatal care routine")
        recommendations.append("Maintain a balanced diet rich in nutrients")
        recommendations.append("Stay hydrated and get adequate rest")
    
    if heartbeat_status and "⚠️" in heartbeat_status:
        recommendations.insert(0, "Discuss heart rate findings with your doctor")
    
    return UltrasoundAnalysisResponse(
        pregnancy_week=week,
        fruit_comparison=fruit,
        overall_status=overall_status,
        overall_summary=overall_summary,
        measurements_analysis=measurements,
        image_analysis=image_analysis,
        development_notes=development,
        recommendations=recommendations,
        heartbeat_status=heartbeat_status
    )


# Keep the old simple endpoint for backward compatibility
class UltrasoundInput(BaseModel):
    pregnancy_week: int
    image_base64: str | None = None


class UltrasoundInsight(BaseModel):
    pregnancy_week: int
    fruit_comparison: str
    position_note: str
    movement_note: str
    development_note: str
    reassurance: str
    heartbeat_range: str


INSIGHT_TEMPLATES = {
    12: {
        "position": "Baby is forming beautifully",
        "movement": "Tiny limb buds are developing",
        "development": "Fingers and toes are taking shape",
        "reassurance": "Everything is progressing beautifully mama! 🌸",
    },
    16: {
        "position": "Baby is very active in the womb",
        "movement": "Facial expressions are developing",
        "development": "Nervous system is maturing rapidly",
        "reassurance": "Your little one is becoming more active every day! 💕",
    },
    20: {
        "position": "Baby is moving around freely",
        "movement": "Strong limb movements detectable",
        "development": "Halfway there! Baby can hear your voice",
        "reassurance": "What a milestone! You're doing amazing mama! 🌟",
    },
    24: {
        "position": "Baby is head-down or still moving",
        "movement": "Lungs are developing — breathing movements seen",
        "development": "Baby responds to sounds from outside",
        "reassurance": "Growing strong and healthy! Keep going mama! 💪",
    },
    28: {
        "position": "Baby may be head-down or breech",
        "movement": "Eyes can open and close now",
        "development": "Sleep-wake cycles are established",
        "reassurance": "Your baby is practicing for the big world! 🌙",
    },
    32: {
        "position": "Getting into position for birth",
        "movement": "Very active with room to move",
        "development": "Practicing breathing movements daily",
        "reassurance": "Almost there! Your baby is getting ready! 🎀",
    },
    36: {
        "position": "Most babies are head-down now",
        "movement": "Movements may feel more restrained",
        "development": "Organs are nearly all mature",
        "reassurance": "The finish line is in sight! You got this mama! 🌈",
    },
    40: {
        "position": "Baby is ready for birth!",
        "movement": "Less space but still moving daily",
        "development": "Fully developed and ready to meet you",
        "reassurance": "Your baby is coming soon! Sending you strength! 💖",
    },
}


def _get_heartbeat_range(week: int) -> str:
    if week < 16:
        return "150-170 BPM (early development)"
    elif week < 24:
        return "140-160 BPM"
    elif week < 32:
        return "130-150 BPM"
    else:
        return "110-150 BPM"


@router.post("/ultrasound/analyze", response_model=UltrasoundInsight)
async def analyze_ultrasound(data: UltrasoundInput):
    """Generate emotional, supportive AI insights from ultrasound data (simple version)."""
    week = data.pregnancy_week
    closest = min(INSIGHT_TEMPLATES.keys(), key=lambda k: abs(k - week))
    template = INSIGHT_TEMPLATES[closest]

    # Get fruit comparison
    fruit_keys = sorted(FRUIT_SIZE.keys())
    fruit_week = min(fruit_keys, key=lambda k: abs(k - week))
    fruit = FRUIT_SIZE[fruit_week]

    return UltrasoundInsight(
        pregnancy_week=week,
        fruit_comparison=fruit,
        position_note=template["position"],
        movement_note=template["movement"],
        development_note=template["development"],
        reassurance=template["reassurance"],
        heartbeat_range=_get_heartbeat_range(week),
    )