"""Test script to list available Gemini models"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment")
    exit(1)

print(f"Using API Key: {GEMINI_API_KEY[:10]}...")

genai.configure(api_key=GEMINI_API_KEY)

print("\nListing available models:")
print("-" * 60)

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description[:80]}...")
        print()

print("-" * 60)
print("\nTrying to generate content with different models:")

test_models = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-pro",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-flash",
]

for model_name in test_models:
    try:
        print(f"\nTesting: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"  ✓ SUCCESS: {response.text[:50]}")
    except Exception as e:
        print(f"  ✗ FAILED: {str(e)[:100]}")
