# 🚀 Quick Start: Ultrasound AI Analysis

## 1. Restart Services (Required)

```bash
restart-ai-and-preview.bat
```

This will restart:
- AI Service (port 8000) with new Gemini API key
- Baby Preview Service (port 8084) with new HF token

**Also restart Pregnancy Service:**
- Stop the current pregnancy service window
- Rerun from your startup script

## 2. Test the AI Endpoint

```bash
test-ultrasound-ai.bat
```

**Expected Output:**
```json
{
  "pregnancy_week": 20,
  "fruit_comparison": "a Banana 🍌",
  "overall_status": "NORMAL",
  "overall_summary": "✅ All measurements are within normal ranges!...",
  "measurements_analysis": [
    {
      "measurement_name": "Weight",
      "actual_value": 310.0,
      "expected_value": 300.0,
      "percentile": "50th (Normal)",
      "status": "NORMAL",
      "explanation": "✅ Weight is within normal range..."
    }
  ],
  "recommendations": [...]
}
```

## 3. Create a Baby Growth Record

### Via API (Postman/curl):

```bash
curl -X POST "http://localhost:9090/api/pregnancy/baby-growth" \
  -H "Content-Type: application/json" \
  -d "{
    \"pregnancyId\": 1,
    \"weekNumber\": 20,
    \"weightGrams\": 310,
    \"lengthCm\": 16.5,
    \"headCircumferenceCm\": 4.8,
    \"femurLengthCm\": 3.5,
    \"abdominalCircumferenceCm\": 15.0,
    \"heartRate\": 145,
    \"recordedDate\": \"2026-04-25\"
  }"
```

### Via Frontend:

1. Navigate to Baby Growth section
2. Fill in the form with measurements
3. Optionally upload ultrasound image (base64)
4. Submit
5. Check the response — `aiComparison` field contains the analysis

## 4. View the Analysis

The `aiComparison` field will contain formatted text like:

```
📊 **Overall Status**: NORMAL
✅ All measurements are within normal ranges! Your baby is developing beautifully. 🌸

🍎 **Size Comparison**: Your baby is about the size of a Banana 🍌 at week 20!

📏 **Measurements Analysis**:
• **Weight** (50th (Normal)): ✅ Weight is within normal range (310.0g vs expected 300.0g).
• **Length** (50th (Normal)): ✅ Length is within normal range (16.5cm vs expected 16.4cm).
• **Head Circumference** (50th (Normal)): ✅ Head Circumference is within normal range (4.8cm vs expected 4.7cm).
• **Femur Length** (50th (Normal)): ✅ Femur Length is within normal range (3.5cm vs expected 3.4cm).
• **Abdominal Circumference** (50th (Normal)): ✅ Abdominal Circumference is within normal range (15.0cm vs expected 14.8cm).

💓 **Heart Rate**: ✅ Heart rate is normal (145 BPM, expected 140-160 BPM)

🌱 **Development**: Active growth phase — baby is moving and developing senses. 💫

💡 **Recommendations**:
• Continue your current prenatal care routine
• Maintain a balanced diet rich in nutrients
• Stay hydrated and get adequate rest
```

## 5. Test with Ultrasound Image

To test image analysis:

1. Convert an ultrasound image to base64
2. Include it in the request as `ultrasoundImageUrl`
3. Gemini will analyze the image and add insights

**Example with image:**
```json
{
  "pregnancyId": 1,
  "weekNumber": 20,
  "weightGrams": 310,
  "ultrasoundImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

## Troubleshooting

### ❌ "AI analysis unavailable"
**Solution:** Check Gemini API key in `ai-service/.env`

### ❌ "Connection refused to localhost:8000"
**Solution:** Ensure AI service is running

### ❌ Empty `aiComparison` field
**Solution:** Provide at least one measurement or image

### ❌ "Gemini API key not configured"
**Solution:** Restart AI service after updating `.env`

## What Gets Analyzed?

### Measurements (compared to WHO standards):
- ✅ Weight (grams)
- ✅ Length (cm)
- ✅ Head Circumference (cm)
- ✅ Femur Length (cm)
- ✅ Abdominal Circumference (cm)
- ✅ Heart Rate (BPM)

### Ultrasound Image (Gemini Vision):
- Visible fetal structures
- Fetal position
- Development assessment
- Quality check
- Supportive feedback

## Status Indicators

- **NORMAL** ✅: All good!
- **MONITOR** 📋: One measurement needs attention
- **CONCERN** ⚠️: Multiple measurements outside range

## Next Steps

1. ✅ Test the endpoint
2. ✅ Create a test record
3. ✅ View the AI analysis
4. 🎨 Update frontend to display analysis beautifully
5. 📱 Add image upload functionality
6. 🔔 Add notifications for concerning results

---

**Ready to go!** 🎉

The intelligent ultrasound analysis is now active and will automatically analyze all baby growth records!
