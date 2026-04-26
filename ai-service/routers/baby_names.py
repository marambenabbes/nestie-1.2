"""
Baby Name Suggestion Router
Provides AI-powered baby name suggestions based on parents' names and preferences.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
import google.generativeai as genai
import os
import json

router = APIRouter()

# Note: Gemini configuration happens in the endpoint function
# to ensure environment variables are loaded first by main.py


class BabyNameRequest(BaseModel):
    baby_gender: Literal["boy", "girl"] = Field(..., description="Gender of the baby")
    mother_name: str = Field(..., min_length=1, description="Mother's name")
    father_name: str = Field(..., min_length=1, description="Father's name")
    name_style: Literal["arabic", "other"] = Field(..., description="Name style preference")
    pregnancy_week: int = Field(..., ge=12, description="Current pregnancy week (must be >= 12)")


class NameSuggestion(BaseModel):
    name: str
    meaning: str
    origin: str
    style: Literal["arabic", "other"]
    why: str


class BabyNameResponse(BaseModel):
    congratulations: str
    gender: Literal["boy", "girl"]
    suggestions: list[NameSuggestion]


@router.post("/baby-names/suggest", response_model=BabyNameResponse)
async def suggest_baby_names(request: BabyNameRequest):
    """
    Generate AI-powered baby name suggestions based on parents' names and preferences.
    Only available from week 12 onwards (month 3+).
    """
    
    # Configure Gemini API (done here to ensure env vars are loaded)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Please check environment variables."
        )
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Validate pregnancy week (month 3 = week 12+)
    if request.pregnancy_week < 12:
        raise HTTPException(
            status_code=400,
            detail="Baby name suggestions are only available from month 3 (week 12) onwards"
        )
    
    # Build the prompt
    prompt = f"""You are a baby name suggestion assistant inside a pregnancy tracker app.

You receive the following input:
- baby_gender: "{request.baby_gender}"
- mother_name: "{request.mother_name}"
- father_name: "{request.father_name}"
- name_style: "{request.name_style}"

Respond ONLY with a valid JSON object. No preamble, no markdown, no text outside the JSON.

Response format:
{{
  "congratulations": "A warm, short congratulations message addressing the mother and father by name (max 1 sentence)",
  "gender": "{request.baby_gender}",
  "suggestions": [
    {{
      "name": "Baby name",
      "meaning": "Short meaning of the name (max 10 words)",
      "origin": "e.g. Arabic, French, Hebrew, English",
      "style": "{request.name_style}",
      "why": "One short sentence on why it matches the parents names in sound or meaning"
    }}
  ]
}}

Rules:
- Return exactly 3 name suggestions
- All names must match baby_gender exactly — only {request.baby_gender} names
- If name_style is "arabic": return only Arabic origin names
- If name_style is "other": return only non-Arabic names (French, English, Hebrew, Spanish, etc.)
- Names should feel harmonious with the mother and father names — consider syllable flow, first letter, or cultural match
- The "why" field must reference the actual parent names provided: {request.mother_name} and {request.father_name}
- Never suggest a name identical to the mother or father name
- Keep the tone warm, celebratory, and personal

Generate the response now."""

    try:
        # Call Gemini API - using gemini-2.5-flash (stable, fast, and available)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        # Parse the response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        result = json.loads(response_text)
        
        # Validate the response structure
        if "congratulations" not in result or "gender" not in result or "suggestions" not in result:
            raise ValueError("Invalid response structure from AI")
        
        if len(result["suggestions"]) != 3:
            raise ValueError("AI must return exactly 3 suggestions")
        
        # Ensure gender matches
        result["gender"] = request.baby_gender
        
        # Ensure style matches for all suggestions
        for suggestion in result["suggestions"]:
            suggestion["style"] = request.name_style
        
        return BabyNameResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response as JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate baby name suggestions: {str(e)}"
        )
