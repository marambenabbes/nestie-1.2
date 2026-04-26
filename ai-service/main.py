"""
Nestie AI Service — FastAPI + OpenAI + Scikit-learn
Provides chatbot, risk prediction, symptom analysis, nutrition, and growth comparison.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import (
    baby_prediction,
    baby_names,
    chatbot,
    growth_comparison,
    nutrition_ai,
    risk_prediction,
    symptom_analysis,
    ultrasound_analysis,
)

import os
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(
    title="Nestie AI Service",
    description="AI-powered pregnancy assistance: chatbot, risk prediction, symptom anomaly detection, nutrition planning, and baby growth comparison.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot.router, prefix="/api/ai/chat", tags=["Chatbot"])
app.include_router(risk_prediction.router, prefix="/api/ai/risk", tags=["Risk Prediction"])
app.include_router(symptom_analysis.router, prefix="/api/ai/symptoms", tags=["Symptom Analysis"])
app.include_router(nutrition_ai.router, prefix="/api/ai/nutrition", tags=["Nutrition AI"])
app.include_router(growth_comparison.router, prefix="/api/ai/growth", tags=["Growth Comparison"])
app.include_router(ultrasound_analysis.router, prefix="/api/ai", tags=["Ultrasound Analysis"])
app.include_router(baby_prediction.router, prefix="/api/ai", tags=["Baby Prediction"])
app.include_router(baby_names.router, prefix="/api/ai", tags=["Baby Names"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Nestie-ai"}
