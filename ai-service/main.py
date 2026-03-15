"""
Nestie AI Service — FastAPI + OpenAI + Scikit-learn
Provides chatbot, risk prediction, symptom analysis, nutrition, and growth comparison.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import chatbot, risk_prediction, symptom_analysis, nutrition_ai, growth_comparison

load_dotenv()

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


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Nestie-ai"}
