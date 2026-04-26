"""Baby prediction engine using DeepFace + OpenCV + Hugging Face image generation."""

from __future__ import annotations

import base64
import json
import os
import random
import time
from dataclasses import dataclass
from typing import Any

import cv2
import httpx
import numpy as np
from deepface import DeepFace
from dotenv import load_dotenv


SKIN_TONE_TO_SCORE = {"light": 1, "medium": 2, "dark": 3}
SCORE_TO_SKIN_TONE = {1: "light", 2: "medium", 3: "dark"}
EYE_COLOR_CHOICES = {"blue", "green", "brown"}
HF_FALLBACK_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
]
HF_ENDPOINT_TEMPLATES = [
    "https://router.huggingface.co/hf-inference/models/{model}",
    "https://api-inference.huggingface.co/models/{model}",
]
HF_NETWORK_RETRY_ATTEMPTS = 3

# Ensure env vars are available even if server is launched from a different cwd.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Reuse DeepFace models across calls to avoid repeated loading
_deepface_models = {}


def _get_deepface_model(model_name: str):
    """Reserved for future model caching hooks."""
    if model_name not in _deepface_models:
        _deepface_models[model_name] = None
    return _deepface_models[model_name]


@dataclass
class ParentAnalysisResult:
    age: int
    gender: str
    emotion: str
    embedding: list[float]
    skin_tone: str
    eye_color: str


def _strip_data_uri_prefix(raw: str) -> str:
    if "," in raw and raw.lower().startswith("data:"):
        return raw.split(",", 1)[1]
    return raw


def decode_base64_to_bgr(image_b64: str) -> np.ndarray:
    payload = _strip_data_uri_prefix(image_b64)
    image_bytes = base64.b64decode(payload)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise ValueError("Invalid base64 image data")
    return image_bgr


def read_image_to_bgr(image_path: str) -> np.ndarray:
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise ValueError(f"Image not found or invalid path: {image_path}")
    return image_bgr


def bgr_to_jpeg_base64(image_bgr: np.ndarray, quality: int = 90) -> str:
    success, encoded = cv2.imencode(
        ".jpg", image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), int(quality)]
    )
    if not success:
        raise ValueError("Failed to encode image as JPEG")
    return base64.b64encode(encoded.tobytes()).decode("utf-8")


def _safe_face_roi(image_bgr: np.ndarray) -> np.ndarray:
    """Try DeepFace face extraction first; fallback to centered crop."""
    try:
        faces = DeepFace.extract_faces(
            img_path=image_bgr,
            detector_backend="opencv",
            enforce_detection=False,
            align=True,
        )
        if faces:
            face_arr = faces[0].get("face")
            if face_arr is not None:
                if face_arr.max() <= 1.0:
                    face_arr = (face_arr * 255.0).astype(np.uint8)
                face_rgb = np.clip(face_arr, 0, 255).astype(np.uint8)
                return cv2.cvtColor(face_rgb, cv2.COLOR_RGB2BGR)
    except Exception:
        pass

    h, w = image_bgr.shape[:2]
    y1, y2 = h // 5, (h * 4) // 5
    x1, x2 = w // 5, (w * 4) // 5
    return image_bgr[y1:y2, x1:x2]


def estimate_skin_tone(image_bgr: np.ndarray) -> str:
    try:
        face_bgr = _safe_face_roi(image_bgr)

        # Use a skin mask in YCrCb to avoid background/hair influence.
        ycrcb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2YCrCb)
        skin_mask = cv2.inRange(
            ycrcb,
            np.array([0, 133, 77], dtype=np.uint8),
            np.array([255, 173, 127], dtype=np.uint8),
        )

        skin_pixels = face_bgr[skin_mask > 0]
        if skin_pixels.size < 1500:
            h, w = face_bgr.shape[:2]
            center = face_bgr[h // 3 : (2 * h) // 3, w // 3 : (2 * w) // 3]
            skin_pixels = center.reshape(-1, 3)

        if skin_pixels.size == 0:
            return "unknown"

        # LAB lightness gives a more stable tone estimate than raw RGB averages.
        skin_pixels_reshaped = skin_pixels.reshape((-1, 1, 3)).astype(np.uint8)
        lab = cv2.cvtColor(skin_pixels_reshaped, cv2.COLOR_BGR2LAB).reshape((-1, 3))
        lightness = float(np.median(lab[:, 0]))

        if lightness >= 165:
            return "light"
        if lightness >= 118:
            return "medium"
        return "dark"
    except Exception:
        return "unknown"


def _classify_eye_hue(hue_value: float) -> str:
    if 85 <= hue_value <= 140:
        return "blue"
    if 35 <= hue_value < 85:
        return "green"
    return "brown"


def _detect_eye_regions(face_bgr: np.ndarray) -> list[np.ndarray]:
    h, w = face_bgr.shape[:2]
    if h < 20 or w < 20:
        return []

    gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
    upper_gray = gray[: h // 2, :]

    cascade_paths = [
        os.path.join(cv2.data.haarcascades, "haarcascade_eye_tree_eyeglasses.xml"),
        os.path.join(cv2.data.haarcascades, "haarcascade_eye.xml"),
    ]

    detections: list[tuple[int, int, int, int]] = []
    for cascade_path in cascade_paths:
        detector = cv2.CascadeClassifier(cascade_path)
        if detector.empty():
            continue
        eyes = detector.detectMultiScale(
            upper_gray,
            scaleFactor=1.1,
            minNeighbors=6,
            minSize=(max(16, w // 12), max(10, h // 14)),
        )
        if len(eyes) > 0:
            detections = sorted(eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]
            break

    eye_regions: list[np.ndarray] = []
    for ex, ey, ew, eh in detections:
        region = face_bgr[ey : ey + eh, ex : ex + ew]
        if region.size:
            eye_regions.append(region)

    if eye_regions:
        return eye_regions

    # Fallback to two approximate eye windows when detector misses.
    y1, y2 = h // 5, h // 2
    left = face_bgr[y1:y2, w // 12 : w // 2]
    right = face_bgr[y1:y2, w // 2 : (11 * w) // 12]
    return [region for region in [left, right] if region.size]


def estimate_eye_color(image_bgr: np.ndarray) -> str:
    try:
        face = _safe_face_roi(image_bgr)
        eye_regions = _detect_eye_regions(face)
        if not eye_regions:
            return "unknown"

        predictions: list[str] = []
        for eye in eye_regions:
            hsv = cv2.cvtColor(eye, cv2.COLOR_BGR2HSV)
            h_channel, s_channel, v_channel = cv2.split(hsv)

            # Keep likely iris pixels: medium/high saturation and non-extreme brightness.
            mask = (s_channel > 35) & (v_channel > 25) & (v_channel < 220)
            if int(np.count_nonzero(mask)) < 80:
                mask = (s_channel > 20) & (v_channel > 20) & (v_channel < 235)

            if int(np.count_nonzero(mask)) < 40:
                continue

            median_hue = float(np.median(h_channel[mask]))
            predictions.append(_classify_eye_hue(median_hue))

        if not predictions:
            return "brown"

        return max(set(predictions), key=predictions.count)
    except Exception:
        return "unknown"


def _parse_gender(raw_gender: Any) -> str:
    if isinstance(raw_gender, dict):
        if not raw_gender:
            return "unknown"
        key = max(raw_gender, key=raw_gender.get)
        return str(key).lower()
    return str(raw_gender).lower() if raw_gender is not None else "unknown"


def _analyze_single_parent(image_bgr: np.ndarray) -> ParentAnalysisResult:
    """Run DeepFace analyze + represent + skin/eye estimation for one parent."""
    analysis: dict[str, Any] = {}
    embedding: list[float] = []

    try:
        analysis_result = DeepFace.analyze(
            img_path=image_bgr,
            actions=["age", "gender", "emotion"],
            detector_backend="opencv",
            enforce_detection=False,
        )
        if isinstance(analysis_result, list):
            analysis_result = analysis_result[0]
        analysis = analysis_result
    except Exception:
        analysis = {}

    try:
        embedding_data = DeepFace.represent(
            img_path=image_bgr,
            model_name="Facenet512",
            detector_backend="opencv",
            enforce_detection=False,
        )
        embedding = embedding_data[0]["embedding"] if embedding_data else []
    except Exception:
        embedding = []

    age_value = analysis.get("age", 0)
    try:
        age = int(age_value) if age_value is not None else 0
    except Exception:
        age = 0

    return ParentAnalysisResult(
        age=age,
        gender=_parse_gender(analysis.get("dominant_gender", analysis.get("gender"))),
        emotion=str(analysis.get("dominant_emotion", "neutral")),
        embedding=[float(x) for x in embedding],
        skin_tone=estimate_skin_tone(image_bgr),
        eye_color=estimate_eye_color(image_bgr),
    )


def analyze_face_from_bgr(image_bgr: np.ndarray) -> ParentAnalysisResult:
    """Single-parent analysis (kept for backwards compatibility)."""
    return _analyze_single_parent(image_bgr)


def _style_prompt_fragment(style: str) -> str:
    style = (style or "REALISTIC").upper()
    if style == "CARTOON":
        return "cute high-quality cartoon portrait, soft pastel colors"
    if style == "THREE_D":
        return "high-quality 3D render, cinematic lighting, pixar-like aesthetics"
    return "photorealistic portrait, studio lighting, natural skin texture"


def generate_baby_profile(parent1: ParentAnalysisResult, parent2: ParentAnalysisResult) -> dict[str, Any]:
    avg_age = max(0, (parent1.age + parent2.age) // 2)

    if parent1.gender == parent2.gender:
        gender = parent1.gender
    else:
        gender = "mixed"

    emotion = random.choice([parent1.emotion, parent2.emotion])

    s1 = SKIN_TONE_TO_SCORE.get(parent1.skin_tone, 2)
    s2 = SKIN_TONE_TO_SCORE.get(parent2.skin_tone, 2)
    baby_skin_tone = SCORE_TO_SKIN_TONE.get(round((s1 + s2) / 2), "medium")

    eye_candidates = [
        c for c in [parent1.eye_color, parent2.eye_color] if c in EYE_COLOR_CHOICES
    ]
    baby_eye_color = random.choice(eye_candidates or ["brown"])

    embedding_1 = np.array(parent1.embedding, dtype=np.float32)
    embedding_2 = np.array(parent2.embedding, dtype=np.float32)
    if embedding_1.size and embedding_2.size and embedding_1.shape == embedding_2.shape:
        baby_embedding = ((embedding_1 + embedding_2) / 2.0).tolist()
    else:
        baby_embedding = parent1.embedding[:]

    return {
        "age": avg_age,
        "gender": gender,
        "emotion": emotion,
        "skin_tone": baby_skin_tone,
        "eye_color": baby_eye_color,
        "embedding": baby_embedding,
    }


def build_hf_prompt(baby_profile: dict[str, Any], selected_gender: str, selected_age: str, style: str) -> str:
    age_text = {
        "NEWBORN": "newborn baby",
        "SIX_MONTHS": "6-month-old baby",
        "ONE_YEAR": "1-year-old baby",
        "THREE_YEARS": "3-year-old toddler",
    }.get((selected_age or "NEWBORN").upper(), "newborn baby")

    gender_text = {
        "BOY": "baby boy",
        "GIRL": "baby girl",
        "NEUTRAL": "baby",
    }.get((selected_gender or "NEUTRAL").upper(), "baby")

    if baby_profile.get("gender") not in {"mixed", "unknown"}:
        gender_text = baby_profile["gender"]

    return (
        f"{_style_prompt_fragment(style)}, {age_text}, {gender_text}, "
        f"{baby_profile.get('skin_tone', 'medium')} skin tone, "
        f"{baby_profile.get('eye_color', 'brown')} eyes, "
        "happy expression, centered portrait, clean soft background, "
        "high detail, no text, no watermark"
    )


def generate_baby_image_hf(
    prompt: str,
    token_override: str | None = None,
    model_override: str | None = None,
) -> str:
    token = (token_override or os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACE_API_TOKEN") or "").strip()
    if not token:
        raise RuntimeError("HF_API_TOKEN is missing")

    headers = {"Authorization": f"Bearer {token}"}
    requested_model = (model_override or os.getenv("HF_IMAGE_MODEL") or "").strip()
    candidate_models: list[str] = []
    if requested_model:
        candidate_models.append(requested_model)
    for fallback_model in HF_FALLBACK_MODELS:
        if fallback_model not in candidate_models:
            candidate_models.append(fallback_model)

    payload = {
        "inputs": prompt,
        "parameters": {
            "negative_prompt": "blurry, duplicate face, deformed, distorted, watermark, text",
            "guidance_scale": 7.5,
            "num_inference_steps": 35,
        },
        "options": {"wait_for_model": True},
    }

    errors: list[str] = []
    client_headers = {**headers, "Connection": "close"}

    # Retry transient network failures (e.g. WinError 10054) and try both
    # Hugging Face inference endpoints and fallback models.
    for model in candidate_models:
        for endpoint_template in HF_ENDPOINT_TEMPLATES:
            url = endpoint_template.format(model=model)

            for attempt in range(1, HF_NETWORK_RETRY_ATTEMPTS + 1):
                try:
                    with httpx.Client(
                        timeout=httpx.Timeout(connect=20.0, read=180.0, write=30.0, pool=10.0),
                        headers=client_headers,
                        limits=httpx.Limits(max_connections=10, max_keepalive_connections=0),
                    ) as client:
                        response = client.post(url, json=payload)
                except (
                    httpx.ConnectError,
                    httpx.ReadError,
                    httpx.WriteError,
                    httpx.RemoteProtocolError,
                    httpx.NetworkError,
                ) as exc:
                    errors.append(
                        f"{model} @ {url} attempt {attempt}: network error {exc}"
                    )
                    if attempt < HF_NETWORK_RETRY_ATTEMPTS:
                        time.sleep(1.0 * attempt)
                    continue
                except httpx.HTTPError as exc:
                    errors.append(
                        f"{model} @ {url} attempt {attempt}: http error {exc}"
                    )
                    if attempt < HF_NETWORK_RETRY_ATTEMPTS:
                        time.sleep(1.0 * attempt)
                    continue

                content_type = response.headers.get("content-type", "")

                if response.status_code < 400 and "application/json" not in content_type:
                    return base64.b64encode(response.content).decode("utf-8")

                body = response.text[:350]
                lower_body = body.lower()

                # Try next model/endpoint when deprecated or unsupported.
                if response.status_code in (404, 410) or "deprecated" in lower_body:
                    errors.append(f"{model} @ {url}: {response.status_code} {body}")
                    break

                # Retry model loading / transient gateway responses.
                if response.status_code in (429, 500, 502, 503, 504):
                    errors.append(
                        f"{model} @ {url} attempt {attempt}: {response.status_code} {body}"
                    )
                    if attempt < HF_NETWORK_RETRY_ATTEMPTS:
                        time.sleep(1.5 * attempt)
                        continue

                if "application/json" in content_type:
                    try:
                        data = response.json()
                        if isinstance(data, dict) and data.get("error"):
                            errors.append(f"{model} @ {url}: {data['error']}")
                        else:
                            errors.append(f"{model} @ {url}: Unexpected JSON response")
                    except Exception:
                        errors.append(f"{model} @ {url}: {response.status_code} {body}")
                else:
                    errors.append(f"{model} @ {url}: {response.status_code} {body}")

                # Non-retryable response for this endpoint/model.
                break

    raise RuntimeError("Hugging Face generation failed: " + " | ".join(errors))


def run_parent_analysis_and_generate(
    parent1_bgr: np.ndarray,
    parent2_bgr: np.ndarray,
    selected_gender: str = "NEUTRAL",
    selected_age: str = "NEWBORN",
    style: str = "REALISTIC",
    include_full_embedding: bool = False,
    hf_api_token: str | None = None,
    hf_image_model: str | None = None,
) -> dict[str, Any]:
    parent1 = _analyze_single_parent(parent1_bgr)
    parent2 = _analyze_single_parent(parent2_bgr)

    baby_profile = generate_baby_profile(parent1, parent2)
    prompt = build_hf_prompt(baby_profile, selected_gender, selected_age, style)
    generated_image_base64 = generate_baby_image_hf(
        prompt,
        token_override=hf_api_token,
        model_override=hf_image_model,
    )

    def _parent_payload(p: ParentAnalysisResult) -> dict[str, Any]:
        embedding = p.embedding if include_full_embedding else p.embedding[:10]
        return {
            "age": p.age,
            "gender": p.gender,
            "emotion": p.emotion,
            "embedding": embedding,
            "skin_tone": p.skin_tone,
            "eye_color": p.eye_color,
        }

    response = {
        "parent1_features": _parent_payload(parent1),
        "parent2_features": _parent_payload(parent2),
        "baby_profile": {
            **baby_profile,
            "embedding": baby_profile["embedding"] if include_full_embedding else baby_profile["embedding"][:10],
        },
        "generation_prompt": prompt,
        "generated_image_base64": generated_image_base64,
    }
    return response


def run_from_paths(
    parent1_path: str,
    parent2_path: str,
    selected_gender: str = "NEUTRAL",
    selected_age: str = "NEWBORN",
    style: str = "REALISTIC",
) -> dict[str, Any]:
    p1 = read_image_to_bgr(parent1_path)
    p2 = read_image_to_bgr(parent2_path)
    return run_parent_analysis_and_generate(
        p1,
        p2,
        selected_gender=selected_gender,
        selected_age=selected_age,
        style=style,
    )


if __name__ == "__main__":
    parent1_path = "parent1.jpg"
    parent2_path = "parent2.jpg"

    result = run_from_paths(parent1_path, parent2_path)
    print(json.dumps(result, indent=2))