# 🔬 Intelligent Ultrasound Analysis Feature

## Overview

The Nestie platform now includes an **AI-powered ultrasound analysis system** that uses **Gemini Vision AI** to analyze ultrasound images and validate baby growth measurements against WHO fetal growth standards.

## Features

### 1. **Automated Measurement Analysis** 📏
- Compares actual measurements against WHO standards
- Calculates percentiles for each measurement
- Flags measurements that are outside normal ranges
- Provides clear status indicators (NORMAL, MONITOR, CONCERN)

### 2. **Ultrasound Image Analysis** 🖼️
- Uses Gemini Vision AI to analyze ultrasound images
- Identifies visible fetal structures (head, limbs, spine, heart)
- Determines fetal position (head down, breech, transverse)
- Provides developmental insights based on pregnancy week
- Offers warm, supportive feedback for expecting mothers

### 3. **Intelligent Recommendations** 💡
- Generates personalized recommendations based on analysis results
- Suggests follow-up actions when needed
- Provides reassurance when measurements are normal

### 4. **Comprehensive Reporting** 📊
- Overall status summary
- Individual measurement breakdowns
- Heart rate analysis
- Development notes by trimester
- Fruit/vegetable size comparisons

## How It Works

### Backend Flow

1. **User submits baby growth data** via the pregnancy-service API
   - Week number (required)
   - Measurements (optional): weight, length, head circumference, femur length, abdominal circumference
   - Heart rate (optional)
   - Ultrasound image as base64 (optional)

2. **Pregnancy Service** automatically calls the AI Service
   - Sends all measurements and image to `/api/ai/ultrasound/analyze-smart`

3. **AI Service** performs intelligent analysis:
   - Compares measurements against WHO standards for the specific week
   - Calculates percentiles and deviation from expected values
   - Uses Gemini Vision to analyze the ultrasound image
   - Generates clinical recommendations

4. **Results are stored** in the `baby_growth` table
   - `aiComparison` field contains the formatted analysis
   - Available immediately via the API

### API Endpoints

#### Create Baby Growth Record (with AI Analysis)
```http
POST /api/pregnancy/baby-growth
Content-Type: application/json

{
  "pregnancyId": 1,
  "weekNumber": 20,
  "weightGrams": 310,
  "lengthCm": 16.5,
  "headCircumferenceCm": 4.8,
  "femurLengthCm": 3.5,
  "abdominalCircumferenceCm": 15.0,
  "heartRate": 145,
  "ultrasoundImageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "recordedDate": "2026-04-25"
}
```

**Response includes:**
```json
{
  "id": 1,
  "pregnancyId": 1,
  "weekNumber": 20,
  "weightGrams": 310,
  "lengthCm": 16.5,
  "aiComparison": "📊 **Overall Status**: NORMAL\n✅ All measurements are within normal ranges! Your baby is developing beautifully. 🌸\n\n🍎 **Size Comparison**: Your baby is about the size of a Banana 🍌 at week 20!\n\n📏 **Measurements Analysis**:\n• **Weight** (50th (Normal)): ✅ Weight is within normal range (310.0g vs expected 300.0g).\n• **Length** (50th (Normal)): ✅ Length is within normal range (16.5cm vs expected 16.4cm).\n...",
  "createdAt": "2026-04-25T10:30:00"
}
```

#### Direct AI Analysis (AI Service)
```http
POST /api/ai/ultrasound/analyze-smart
Content-Type: application/json

{
  "pregnancy_week": 20,
  "weight_grams": 310,
  "length_cm": 16.5,
  "head_circumference_cm": 4.8,
  "femur_length_cm": 3.5,
  "abdominal_circumference_cm": 15.0,
  "heart_rate": 145,
  "ultrasound_image_base64": "data:image/jpeg;base64,..."
}
```

## WHO Fetal Growth Standards

The system uses WHO-approved average measurements for each pregnancy week:

| Week | Weight (g) | Length (cm) | Head Circ. (cm) | Femur (cm) | Abd. Circ. (cm) |
|------|-----------|-------------|-----------------|------------|-----------------|
| 12   | 14        | 5.4         | 2.4             | 0.8        | 6.0             |
| 16   | 100       | 11.6        | 3.5             | 2.2        | 10.3            |
| 20   | 300       | 16.4        | 4.7             | 3.4        | 14.8            |
| 24   | 600       | 30.0        | 5.7             | 4.4        | 19.2            |
| 28   | 1000      | 35.6        | 6.6             | 5.2        | 23.2            |
| 32   | 1700      | 41.1        | 7.4             | 6.0        | 27.2            |
| 36   | 2600      | 46.2        | 8.2             | 6.7        | 31.2            |
| 40   | 3500      | 50.7        | 9.0             | 7.3        | 35.0            |

## Percentile Calculation

- **50th percentile (Normal)**: Within ±10% of expected value
- **25th/75th percentile**: ±10% to ±20% deviation
- **10th/90th percentile**: >±20% deviation (flagged for monitoring)

## Status Indicators

### Overall Status
- **NORMAL** ✅: All measurements within acceptable ranges
- **MONITOR** 📋: One measurement needs attention
- **CONCERN** ⚠️: Multiple measurements outside normal range

### Individual Measurement Status
- **NORMAL**: Within expected range
- **BELOW_AVERAGE**: Slightly below expected
- **ABOVE_AVERAGE**: Slightly above expected
- **CONCERN**: Significantly outside expected range

## Heart Rate Analysis

Normal fetal heart rate ranges by week:
- **< 16 weeks**: 150-170 BPM
- **16-24 weeks**: 140-160 BPM
- **24-32 weeks**: 130-150 BPM
- **> 32 weeks**: 110-150 BPM

## Gemini Vision Analysis

When an ultrasound image is provided, Gemini analyzes:

1. **Image Quality**: Clarity and suitability for analysis
2. **Visible Structures**: Identifiable fetal anatomy
3. **Position**: Fetal orientation (cephalic, breech, transverse)
4. **Development**: Age-appropriate features
5. **Concerns**: Any visible abnormalities (with professional caution)
6. **Reassurance**: Supportive feedback for the mother

## Configuration

### Environment Variables

**AI Service** (`ai-service/.env`):
```env
GEMINI_API_KEY=AIzaSyCYNmSi-aqXjgBQ_06u6xzp_hHrV6l7Guc
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Pregnancy Service** (`application.yml`):
```yaml
app:
  ai-service:
    url: ${AI_SERVICE_URL:http://localhost:8000}
```

## Usage Example

### Frontend Integration

```typescript
// Create baby growth record with ultrasound
const growthData = {
  pregnancyId: currentPregnancy.id,
  weekNumber: 20,
  weightGrams: 310,
  lengthCm: 16.5,
  headCircumferenceCm: 4.8,
  femurLengthCm: 3.5,
  abdominalCircumferenceCm: 15.0,
  heartRate: 145,
  ultrasoundImageUrl: base64Image, // from file upload
  recordedDate: new Date().toISOString().split('T')[0]
};

this.apiService.createBabyGrowth(growthData).subscribe({
  next: (response) => {
    // AI analysis is in response.aiComparison
    console.log('AI Analysis:', response.aiComparison);
    this.showAnalysisDialog(response.aiComparison);
  }
});
```

## Benefits

### For Healthcare Providers
- Quick identification of growth concerns
- Standardized measurement comparison
- Automated documentation
- Evidence-based recommendations

### For Expecting Mothers
- Clear, understandable analysis
- Reassurance when measurements are normal
- Early awareness of potential concerns
- Educational insights about baby development

## Technical Stack

- **AI Model**: Google Gemini 2.0 Flash (Vision)
- **Standards**: WHO Fetal Growth Charts
- **Backend**: Spring Boot (Java) + FastAPI (Python)
- **Database**: MySQL (stores analysis results)
- **Image Format**: Base64-encoded JPEG/PNG

## Restart Services

After configuration changes, restart the services:

```bash
# Restart both AI and Pregnancy services
restart-ai-and-preview.bat

# Or restart individually
cd ai-service
.venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload

cd pregnancy-service
mvn spring-boot:run
```

## Future Enhancements

- [ ] 3D ultrasound support
- [ ] Doppler flow analysis
- [ ] Anomaly detection with confidence scores
- [ ] Multi-language support for analysis reports
- [ ] Historical growth trend visualization
- [ ] Integration with electronic health records (EHR)

## Support

For issues or questions:
- Check logs in `ai-service/ai.log` and `pregnancy-service/pregnancy.log`
- Verify Gemini API key is valid
- Ensure AI service is running on port 8000
- Confirm pregnancy service can reach AI service

---

**Note**: This AI analysis is meant to **assist** healthcare providers and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions.
