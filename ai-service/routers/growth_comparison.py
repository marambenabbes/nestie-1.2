"""Growth comparison router — compare baby growth against WHO standards."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# WHO fetal growth standards (simplified — weight in grams, length in cm)
WHO_STANDARDS = {
    12: {"weight": 14, "length": 5.4},
    14: {"weight": 43, "length": 8.7},
    16: {"weight": 100, "length": 11.6},
    18: {"weight": 190, "length": 14.2},
    20: {"weight": 300, "length": 16.4},
    22: {"weight": 430, "length": 19.0},
    24: {"weight": 600, "length": 21.0},
    26: {"weight": 760, "length": 23.0},
    28: {"weight": 1000, "length": 25.0},
    30: {"weight": 1300, "length": 27.0},
    32: {"weight": 1700, "length": 28.5},
    34: {"weight": 2100, "length": 32.0},
    36: {"weight": 2600, "length": 34.0},
    38: {"weight": 3000, "length": 35.5},
    40: {"weight": 3400, "length": 36.5},
}


class GrowthInput(BaseModel):
    pregnancy_week: int
    weight_grams: float | None = None
    length_cm: float | None = None
    head_circumference_cm: float | None = None


class GrowthComparison(BaseModel):
    pregnancy_week: int
    baby_weight: float | None
    baby_length: float | None
    weight_percentile: str | None
    length_percentile: str | None
    overall_assessment: str
    fruit_comparison: str
    development_notes: str


@router.post("/compare", response_model=GrowthComparison)
async def compare_growth(data: GrowthInput):
    """Compare baby's growth measurements against WHO standards."""
    # Find closest WHO reference week
    ref_week = min(WHO_STANDARDS.keys(), key=lambda w: abs(w - data.pregnancy_week))
    who = WHO_STANDARDS[ref_week]

    weight_pct = None
    length_pct = None
    assessments = []

    if data.weight_grams is not None and who["weight"]:
        ratio = data.weight_grams / who["weight"]
        weight_pct = _ratio_to_percentile(ratio)
        if ratio < 0.85:
            assessments.append("Weight is below expected range — discuss with your doctor")
        elif ratio > 1.15:
            assessments.append("Weight is above expected range — monitor at next visit")
        else:
            assessments.append("Weight is within normal range ✅")

    if data.length_cm is not None and who["length"]:
        ratio = data.length_cm / who["length"]
        length_pct = _ratio_to_percentile(ratio)
        if ratio < 0.9:
            assessments.append("Length is slightly below average")
        elif ratio > 1.1:
            assessments.append("Length is above average")
        else:
            assessments.append("Length is within normal range ✅")

    overall = " | ".join(assessments) if assessments else "Growth measurements look healthy! 🌟"
    fruit = _get_fruit_comparison(data.pregnancy_week)
    dev_notes = _get_development_notes(data.pregnancy_week)

    return GrowthComparison(
        pregnancy_week=data.pregnancy_week,
        baby_weight=data.weight_grams,
        baby_length=data.length_cm,
        weight_percentile=weight_pct,
        length_percentile=length_pct,
        overall_assessment=overall,
        fruit_comparison=fruit,
        development_notes=dev_notes,
    )


def _ratio_to_percentile(ratio: float) -> str:
    if ratio < 0.8: return "< 10th percentile"
    if ratio < 0.9: return "10th-25th percentile"
    if ratio < 1.1: return "25th-75th percentile (normal)"
    if ratio < 1.2: return "75th-90th percentile"
    return "> 90th percentile"


def _get_fruit_comparison(week: int) -> str:
    fruits = {
        4: "🫐 Poppy seed", 6: "🫘 Lentil", 8: "🫐 Raspberry", 10: "🍓 Strawberry",
        12: "🍋 Lime", 14: "🍋 Lemon", 16: "🥑 Avocado", 18: "🫑 Bell pepper",
        20: "🍌 Banana", 22: "🥕 Carrot", 24: "🌽 Ear of corn", 26: "🥬 Lettuce head",
        28: "🍆 Eggplant", 30: "🥥 Coconut", 32: "🍍 Pineapple", 34: "🍈 Cantaloupe",
        36: "🥬 Romaine lettuce", 38: "🍉 Mini watermelon", 40: "🎃 Small pumpkin",
    }
    closest = min(fruits.keys(), key=lambda w: abs(w - week))
    return f"Your baby is about the size of a {fruits[closest]}!"


def _get_development_notes(week: int) -> str:
    notes = {
        12: "Reflexes are developing, baby can open and close fingers 🤚",
        16: "Baby can make facial expressions, nervous system maturing 😊",
        20: "Halfway there! Baby can hear your voice now 🎵",
        24: "Lungs are developing, baby responds to sounds 🫁",
        28: "Eyes can open and close, baby has sleep-wake cycles 😴",
        32: "Baby is practicing breathing, gaining weight quickly 📈",
        36: "Most organs are mature, baby is getting into position 👶",
        40: "Full term! Baby is ready to meet you! 🎉",
    }
    closest = min(notes.keys(), key=lambda w: abs(w - week))
    return notes[closest]
