package com.nestie.pregnancy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class UltrasoundAIService {

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public UltrasoundAIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Call AI service to analyze ultrasound with measurements and image
     */
    public String analyzeUltrasound(
            Integer weekNumber,
            String ultrasoundImageBase64,
            Double weightGrams,
            Double lengthCm,
            Double headCircumferenceCm,
            Double femurLengthCm,
            Double abdominalCircumferenceCm,
            Double heartRate
    ) {
        try {
            String url = aiServiceUrl + "/api/ai/ultrasound/analyze-smart";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("pregnancy_week", weekNumber);
            
            if (ultrasoundImageBase64 != null && !ultrasoundImageBase64.isBlank()) {
                requestBody.put("ultrasound_image_base64", ultrasoundImageBase64);
            }
            if (weightGrams != null) requestBody.put("weight_grams", weightGrams);
            if (lengthCm != null) requestBody.put("length_cm", lengthCm);
            if (headCircumferenceCm != null) requestBody.put("head_circumference_cm", headCircumferenceCm);
            if (femurLengthCm != null) requestBody.put("femur_length_cm", femurLengthCm);
            if (abdominalCircumferenceCm != null) requestBody.put("abdominal_circumference_cm", abdominalCircumferenceCm);
            if (heartRate != null) requestBody.put("heart_rate", heartRate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Calling AI service for ultrasound analysis at week {}", weekNumber);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse and format the response
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                return formatAIAnalysis(jsonResponse);
            } else {
                log.warn("AI service returned non-OK status: {}", response.getStatusCode());
                return "AI analysis unavailable at this time.";
            }

        } catch (Exception e) {
            log.error("Failed to call AI service for ultrasound analysis", e);
            return "AI analysis failed: " + e.getMessage();
        }
    }

    /**
     * Format AI analysis response into a readable string
     */
    private String formatAIAnalysis(JsonNode response) {
        try {
            StringBuilder analysis = new StringBuilder();

            // Overall status
            String overallStatus = response.path("overall_status").asText();
            String overallSummary = response.path("overall_summary").asText();
            analysis.append("📊 **Overall Status**: ").append(overallStatus).append("\n");
            analysis.append(overallSummary).append("\n\n");

            // Fruit comparison
            String fruit = response.path("fruit_comparison").asText();
            int week = response.path("pregnancy_week").asInt();
            analysis.append("🍎 **Size Comparison**: Your baby is about the size of ").append(fruit)
                    .append(" at week ").append(week).append("!\n\n");

            // Measurements analysis
            JsonNode measurements = response.path("measurements_analysis");
            if (measurements.isArray() && measurements.size() > 0) {
                analysis.append("📏 **Measurements Analysis**:\n");
                for (JsonNode measurement : measurements) {
                    String name = measurement.path("measurement_name").asText();
                    String status = measurement.path("status").asText();
                    String explanation = measurement.path("explanation").asText();
                    String percentile = measurement.path("percentile").asText();
                    
                    analysis.append("• **").append(name).append("** (").append(percentile).append("): ")
                            .append(explanation).append("\n");
                }
                analysis.append("\n");
            }

            // Heart rate
            String heartbeat = response.path("heartbeat_status").asText();
            if (heartbeat != null && !heartbeat.equals("null") && !heartbeat.isBlank()) {
                analysis.append("💓 **Heart Rate**: ").append(heartbeat).append("\n\n");
            }

            // Image analysis (if available)
            String imageAnalysis = response.path("image_analysis").asText();
            if (imageAnalysis != null && !imageAnalysis.equals("null") && !imageAnalysis.isBlank()) {
                analysis.append("🔍 **Ultrasound Image Analysis**:\n").append(imageAnalysis).append("\n\n");
            }

            // Development notes
            String development = response.path("development_notes").asText();
            analysis.append("🌱 **Development**: ").append(development).append("\n\n");

            // Recommendations
            JsonNode recommendations = response.path("recommendations");
            if (recommendations.isArray() && recommendations.size() > 0) {
                analysis.append("💡 **Recommendations**:\n");
                for (JsonNode rec : recommendations) {
                    analysis.append("• ").append(rec.asText()).append("\n");
                }
            }

            return analysis.toString();

        } catch (Exception e) {
            log.error("Failed to format AI analysis", e);
            return response.toString();
        }
    }
}
