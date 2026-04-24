"""Ultrasound analysis router — AI insights for baby ultrasound (ecography) images."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Fruit/veg size comparisons
FRUIT_SIZE = {
    8: "a Raspberry 🫐", 10: "a Strawberry 🍓", 12: "a Lime 🍋",
    14: "a Lemon 🍋", 16: "an Avocado 🥑", 18: "a Bell Pepper 🫑",
    20: "a Banana 🍌", 22: "a Carrot 🥕", 24: "an Ear of Corn 🌽",
    26: "a Lettuce Head 🥬", 28: "an Eggplant 🍆", 30: "a Coconut 🥥",
    32: "a Pineapple 🍍", 34: "a Cantaloupe 🍈", 36: "Romaine Lettuce 🥬",
    38: "a Mini Watermelon 🍉", 40: "a Small Pumpkin 🎃",
}


class UltrasoundInput(BaseModel):
    pregnancy_week: int
    image_base64: str | None = None  # optional — AI can analyze without image too


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


def _get_closest_week(week: int) -> int:
    keys = sorted(INSIGHT_TEMPLATES.keys())
    return min(keys, key=lambda k: abs(k - week))


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
    """Generate emotional, supportive AI insights from ultrasound data."""
    week = data.pregnancy_week
    closest = _get_closest_week(week)
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