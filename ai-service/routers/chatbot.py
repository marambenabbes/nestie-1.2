"""Chatbot router — GPT-powered pregnancy assistant with local fallback."""

import os
import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

SYSTEM_PROMPT = """You are Nestie AI, a warm, empathetic, and knowledgeable pregnancy assistant.
You provide evidence-based information about pregnancy, baby development, nutrition, exercise, and common symptoms.
Always be reassuring but remind users to consult their healthcare provider for medical decisions.
Use a friendly, supportive tone with occasional emojis 🌸💕. Keep responses concise (under 200 words)."""

# Local fallback responses when OpenAI is not available
LOCAL_RESPONSES = {
    "nutrition": [
        "Great question about nutrition! 🥗 During pregnancy, focus on:\n• **Folate-rich foods**: leafy greens, beans, fortified cereals\n• **Iron**: lean meat, spinach, lentils\n• **Calcium**: dairy, almonds, broccoli\n• **DHA/Omega-3**: salmon, walnuts, chia seeds\n\nAim for about 300 extra calories/day in the 2nd trimester and 450 in the 3rd. Stay hydrated with 8-10 glasses of water daily! 💕\n\nAlways consult your doctor for personalized dietary advice.",
        "Healthy eating is so important right now! 🌸 Here are key nutrients:\n• **Protein**: 71g/day — eggs, chicken, tofu, Greek yogurt\n• **Iron**: 27mg/day — red meat, spinach, fortified cereals\n• **Folic acid**: 600mcg/day — lentils, asparagus, avocado\n\nTry to eat small, frequent meals to manage nausea and heartburn. Avoid raw fish, unpasteurized dairy, and excess caffeine. You're doing amazing! 💪"
    ],
    "exercise": [
        "Staying active during pregnancy is wonderful! 🏃‍♀️ Safe exercises include:\n• **Walking**: 30 min/day, great for all trimesters\n• **Prenatal yoga**: helps with flexibility and relaxation\n• **Swimming**: low-impact, supports your growing belly\n• **Pelvic floor exercises**: Kegels strengthen important muscles\n\n⚠️ Avoid contact sports, hot yoga, and exercises lying flat on your back after week 20. Listen to your body and stay hydrated! 💕",
        "Exercise is great for you and baby! 💪 Aim for 150 minutes of moderate activity per week:\n• Brisk walking or light jogging (if you did before)\n• Prenatal pilates or yoga\n• Stationary cycling\n• Light strength training\n\nStop exercising if you feel dizzy, short of breath, or experience any pain. Always check with your doctor first! 🌸"
    ],
    "symptoms": [
        "Pregnancy symptoms can vary a lot! Here's what's common by trimester 🌸:\n\n**1st Trimester**: Nausea, fatigue, breast tenderness, mood changes\n**2nd Trimester**: Back pain, round ligament pain, heartburn, leg cramps\n**3rd Trimester**: Braxton Hicks, insomnia, swollen feet, frequent urination\n\n⚠️ **Contact your doctor immediately if you experience**: heavy bleeding, severe headache, vision changes, sudden swelling, or reduced baby movement.\n\nMost symptoms are normal but always trust your instincts! 💕",
    ],
    "warning": [
        "It's important to know the warning signs! ⚠️ Please seek immediate medical attention if you experience:\n\n🔴 **Call your doctor NOW**:\n• Vaginal bleeding or fluid leaking\n• Severe headache or vision changes\n• Sudden swelling of face/hands\n• Baby stops moving or moves much less\n• Severe abdominal pain\n• Fever over 100.4°F (38°C)\n• Painful urination\n\nTrust your instincts — it's always better to call and ask! You know your body best. 💕"
    ],
    "general": [
        "Hi mama! 🌸 I'm here to help with your pregnancy journey. Here are some tips:\n\n• Take your prenatal vitamins daily\n• Stay hydrated — aim for 8-10 glasses of water\n• Get at least 7-9 hours of sleep\n• Practice relaxation techniques for stress\n• Keep all your prenatal appointments\n• Start thinking about your birth plan\n\nRemember, every pregnancy is unique. Don't compare yourself to others — you're doing an amazing job! 💕\n\nWhat specific topic would you like to know more about?",
        "Welcome to Nestie! 🎀 Here are some helpful reminders:\n\n📅 **Prenatal visits**: Monthly until week 28, then biweekly, then weekly after week 36\n💊 **Key supplements**: Prenatal vitamin, folic acid, iron, DHA\n🛏️ **Sleep**: Try sleeping on your left side for best blood flow\n📱 **Track**: Log your symptoms and baby movements regularly\n\nI can help with nutrition advice, exercise tips, symptom information, and more! What would you like to know? 💕"
    ]
}


class ChatRequest(BaseModel):
    message: str
    pregnancy_week: int | None = None
    context: list[dict] | None = None


class ChatResponse(BaseModel):
    message: str
    suggested_actions: list[str] | None = None


def _get_local_response(message: str) -> str:
    """Generate a response using local knowledge base."""
    lower = message.lower()
    if any(w in lower for w in ["eat", "food", "diet", "nutrition", "meal", "vitamin", "supplement", "calorie"]):
        return random.choice(LOCAL_RESPONSES["nutrition"])
    elif any(w in lower for w in ["exercise", "workout", "walk", "yoga", "swim", "active", "fitness"]):
        return random.choice(LOCAL_RESPONSES["exercise"])
    elif any(w in lower for w in ["symptom", "nausea", "pain", "cramp", "tired", "fatigue", "headache", "swelling", "heartburn"]):
        return random.choice(LOCAL_RESPONSES["symptoms"])
    elif any(w in lower for w in ["warning", "danger", "emergency", "bleed", "blood", "fever", "worry", "concern", "safe"]):
        return random.choice(LOCAL_RESPONSES["warning"])
    else:
        return random.choice(LOCAL_RESPONSES["general"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY", "")

    # Use local fallback if no API key is configured
    if not api_key or api_key == "your-openai-api-key-here":
        reply = _get_local_response(request.message)
        if request.pregnancy_week:
            trimester = 1 if request.pregnancy_week <= 12 else (2 if request.pregnancy_week <= 27 else 3)
            reply += f"\n\n📅 You're in week {request.pregnancy_week} (trimester {trimester}) — keep going, mama! 🌟"
        return ChatResponse(
            message=reply,
            suggested_actions=_extract_actions(request.message),
        )

    # Use OpenAI if API key is available
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if request.pregnancy_week:
            messages.append({"role": "system", "content": f"The user is currently in week {request.pregnancy_week} of pregnancy."})
        if request.context:
            messages.extend(request.context[-6:])
        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4"),
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )

        reply = response.choices[0].message.content
        return ChatResponse(
            message=reply,
            suggested_actions=_extract_actions(request.message),
        )
    except Exception as e:
        # Fall back to local if OpenAI fails
        reply = _get_local_response(request.message)
        return ChatResponse(
            message=reply,
            suggested_actions=_extract_actions(request.message),
        )


def _extract_actions(message: str) -> list[str]:
    """Suggest quick actions based on user message keywords."""
    actions = []
    lower = message.lower()
    if any(w in lower for w in ["pain", "cramp", "bleed", "spotting"]):
        actions.append("Log symptom")
    if any(w in lower for w in ["eat", "food", "diet", "nutrition"]):
        actions.append("View nutrition plan")
    if any(w in lower for w in ["appointment", "doctor", "visit"]):
        actions.append("Book appointment")
    return actions or None
