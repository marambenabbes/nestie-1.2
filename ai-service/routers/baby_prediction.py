"""Baby prediction router: analyzes two parent photos and generates a baby image."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from baby_prediction_engine import (
    decode_base64_to_bgr,
    run_parent_analysis_and_generate,
)

router = APIRouter()


class BabyPredictionRequest(BaseModel):
    parent1_photo: str = Field(..., description="Parent 1 photo as base64 or data URI")
    parent2_photo: str = Field(..., description="Parent 2 photo as base64 or data URI")
    selected_gender: str = Field(default="NEUTRAL", pattern="^(BOY|GIRL|NEUTRAL)$")
    selected_age: str = Field(
        default="NEWBORN", pattern="^(NEWBORN|SIX_MONTHS|ONE_YEAR|THREE_YEARS)$"
    )
    style: str = Field(default="REALISTIC", pattern="^(REALISTIC|CARTOON|THREE_D)$")
    include_full_embedding: bool = False
    hf_api_token: str | None = None
    hf_image_model: str | None = None


@router.post("/baby-prediction/analyze-generate")
async def analyze_and_generate(request: BabyPredictionRequest):
    """Analyze both parent faces, compute baby profile, and generate baby image."""
    try:
        parent1_bgr = decode_base64_to_bgr(request.parent1_photo)
        parent2_bgr = decode_base64_to_bgr(request.parent2_photo)

        result = run_parent_analysis_and_generate(
            parent1_bgr=parent1_bgr,
            parent2_bgr=parent2_bgr,
            selected_gender=request.selected_gender,
            selected_age=request.selected_age,
            style=request.style,
            include_full_embedding=request.include_full_embedding,
            hf_api_token=request.hf_api_token,
            hf_image_model=request.hf_image_model,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
