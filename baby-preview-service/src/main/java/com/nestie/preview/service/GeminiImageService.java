package com.nestie.preview.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Two-step baby image generation using free-tier models:
 *
 * Step 1 — Gemini 2.0 Flash (free, text-only, high quota):
 *   Analyze both parent photos and produce a detailed text description
 *   of the predicted baby's appearance.
 *
 * Step 2 — HuggingFace Inference API (free):
 *   Send that description to a text-to-image model (FLUX.1-schnell)
 *   and get the baby image back as bytes.
 */
@Slf4j
@Service
public class GeminiImageService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.huggingface.api-token:}")
    private String hfApiToken;

    private final RestTemplate restTemplate = new RestTemplate();

    // ─── Model configuration ────────────────────────────────────────

    /** Free-tier text models with vision support (high quota). */
    private static final String[] GEMINI_TEXT_MODELS = {
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
    };

    /** Free HuggingFace text-to-image models, tried in order. */
    private static final String[] HF_IMAGE_MODELS = {
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0",
    };

    // ─── Prompt templates ───────────────────────────────────────────

    /**
     * Prompt sent to Gemini (text model) with the two parent photos.
     * Gemini will return a detailed text description of the predicted baby.
     * %1$s = style label, %2$s = age text, %3$s = gender text, %4$s = style desc
     */
    private static final String ANALYSIS_PROMPT =
        "You are a genetics-inspired portrait description generator.\n\n" +
        "I am providing two photos:\n" +
        "  - Photo 1: the MOTHER\n" +
        "  - Photo 2: the FATHER\n\n" +
        "Carefully analyze both parents' facial features: skin tone, hair color, " +
        "hair texture, eye color, eye shape, nose shape, lip shape, face shape, " +
        "and any other distinguishing traits.\n\n" +
        "Then write a SINGLE, DETAILED image-generation prompt (for a text-to-image AI model) " +
        "that describes a cute, happy, healthy %2$s %3$s whose appearance " +
        "realistically blends both parents' features.\n\n" +
        "CRITICAL RULES for the description:\n" +
        "- SKIN TONE must be a realistic genetic blend of both parents' skin tones.\n" +
        "  If both parents are dark-skinned → baby MUST be dark-skinned.\n" +
        "  If both are light-skinned → baby MUST be light-skinned.\n" +
        "  If they differ → blend realistically.\n" +
        "- Blend eye color, eye shape, nose, lips, and face shape from both parents.\n" +
        "- Hair color and texture must be genetically plausible.\n" +
        "- The baby should be smiling and look adorable.\n" +
        "- Do NOT replicate the exact identity of either parent.\n\n" +
        "IMAGE STYLE: %1$s — %4$s\n\n" +
        "OUTPUT FORMAT:\n" +
        "Return ONLY the image-generation prompt text. No explanation, no markdown, " +
        "no quotes, no preamble. Just the prompt that will be sent to a text-to-image model.";

    private static final String STYLE_REALISTIC_DESC =
        "Photorealistic studio portrait. Professional soft lighting, shallow depth of field, " +
        "natural skin texture with accurate complexion, warm tones, soft cream/beige background. " +
        "4K detail, professional photography quality.";

    private static final String STYLE_CARTOON_DESC =
        "Cute Pixar/Disney-inspired cartoon illustration. Soft pastel color palette, " +
        "slightly exaggerated cute proportions, big expressive eyes, rounded features, " +
        "warm cheerful expression, soft gradient nursery background. " +
        "High-quality digital illustration. Maintain accurate skin tone.";

    private static final String STYLE_3D_DESC =
        "Pixar-quality 3D rendered portrait. Soft ambient occlusion lighting, cinematic quality, " +
        "vibrant natural colors, smooth subsurface scattering on skin, cute proportions, " +
        "warm nursery background with soft bokeh. 4K render quality. Accurate skin tone.";

    // ─── Public API ─────────────────────────────────────────────────

    /**
     * Build a metadata string encoding the user's choices.
     * Stored as promptUsed in the database.
     */
    public String buildPrompt(String gender, String age, String style) {
        String ageText = switch (age) {
            case "NEWBORN"      -> "newborn (0-1 month old)";
            case "SIX_MONTHS"   -> "6-month-old";
            case "ONE_YEAR"     -> "1-year-old";
            case "THREE_YEARS"  -> "3-year-old";
            default             -> "newborn";
        };

        String genderText = switch (gender) {
            case "BOY"     -> "baby boy";
            case "GIRL"    -> "baby girl";
            case "NEUTRAL" -> "baby";
            default        -> "baby";
        };

        return String.format("style=%s | age=%s | gender=%s", style, ageText, genderText);
    }

    /**
     * Two-step generation:
     *  1) Gemini analyses parent photos → baby description text
     *  2) HuggingFace generates image from that description
     */
    public String generateBabyImage(String motherBase64, String fatherBase64, String prompt) {
        // ── Validate keys ───────────────────────────────────────────
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new RuntimeException(
                "Gemini API key is not configured. Set GEMINI_API_KEY environment variable.");
        }
        if (hfApiToken == null || hfApiToken.isBlank()) {
            throw new RuntimeException(
                "HuggingFace API token is not configured. Set HF_API_TOKEN environment variable.");
        }

        // ── Parse metadata ──────────────────────────────────────────
        String style      = extractField(prompt, "style");
        String ageText    = extractField(prompt, "age");
        String genderText = extractField(prompt, "gender");

        // Clean base64
        motherBase64 = stripDataUriPrefix(motherBase64);
        fatherBase64 = stripDataUriPrefix(fatherBase64);

        String styleDesc = switch (style) {
            case "CARTOON" -> STYLE_CARTOON_DESC;
            case "THREE_D" -> STYLE_3D_DESC;
            default        -> STYLE_REALISTIC_DESC;
        };
        String styleLabel = switch (style) {
            case "CARTOON" -> "cartoon illustration";
            case "THREE_D" -> "3D rendered";
            default        -> "photorealistic";
        };

        // ── STEP 1: Gemini text analysis ────────────────────────────
        String analysisPrompt = String.format(ANALYSIS_PROMPT,
                styleLabel, ageText, genderText, styleDesc);

        log.info("=== STEP 1: Gemini analysis ===");
        String babyDescription = callGeminiTextModel(analysisPrompt, motherBase64, fatherBase64);
        log.info("Baby description from Gemini (len={}): {}", babyDescription.length(),
                babyDescription.substring(0, Math.min(300, babyDescription.length())));

        // ── STEP 2: HuggingFace image generation ────────────────────
        log.info("=== STEP 2: HuggingFace image generation ===");
        String imageBase64 = callHuggingFaceImageGen(babyDescription);
        log.info("Image generated successfully, base64 length={}", imageBase64.length());

        return imageBase64;
    }

    // ─── Step 1: Gemini text analysis ───────────────────────────────

    private String callGeminiTextModel(String prompt, String motherBase64, String fatherBase64) {
        Map<String, Object> requestBody = buildGeminiTextRequest(prompt, motherBase64, fatherBase64);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (String model : GEMINI_TEXT_MODELS) {
            try {
                String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, geminiApiKey);

                log.info("Trying Gemini text model: {}", model);
                ResponseEntity<Map> response = restTemplate.exchange(
                        url, HttpMethod.POST, entity, Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    String text = extractTextFromGeminiResponse(response.getBody());
                    if (text != null && !text.isBlank()) {
                        log.info("Got baby description from model '{}'", model);
                        return text;
                    }
                    log.warn("Model '{}' returned no text, trying next", model);
                }
            } catch (Exception e) {
                String msg = e.getMessage();
                log.warn("Gemini text model '{}' failed: {}", model,
                        msg != null ? msg.substring(0, Math.min(300, msg.length())) : "unknown");
            }
        }

        throw new RuntimeException("All Gemini text models failed to analyze parent photos.");
    }

    private Map<String, Object> buildGeminiTextRequest(
            String prompt, String motherBase64, String fatherBase64) {

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        // Mother photo
        parts.add(Map.of("inline_data", Map.of(
                "mime_type", guessMimeType(motherBase64),
                "data", motherBase64)));

        // Father photo
        parts.add(Map.of("inline_data", Map.of(
                "mime_type", guessMimeType(fatherBase64),
                "data", fatherBase64)));

        // No responseModalities → defaults to TEXT only (free tier friendly)
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1024);

        return Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", generationConfig);
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map<String, Object> body) {
        try {
            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;

            Map<String, Object> content =
                    (Map<String, Object>) candidates.get(0).get("content");
            if (content == null) return null;

            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");
            if (parts == null) return null;

            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> part : parts) {
                if (part.containsKey("text")) {
                    sb.append(part.get("text"));
                }
            }
            return sb.toString().trim();
        } catch (Exception e) {
            log.error("Failed to parse Gemini text response: {}", e.getMessage());
            return null;
        }
    }

    // ─── Step 2: HuggingFace image generation ───────────────────────

    private String callHuggingFaceImageGen(String imagePrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + hfApiToken);
        headers.set("Accept", "image/*");

        // Truncate prompt if too long for the model
        if (imagePrompt.length() > 500) {
            imagePrompt = imagePrompt.substring(0, 500);
        }

        Map<String, Object> payload = Map.of("inputs", imagePrompt);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        for (String model : HF_IMAGE_MODELS) {
            try {
                String url = "https://router.huggingface.co/hf-inference/models/" + model;
                log.info("Trying HuggingFace model: {}", model);

                ResponseEntity<byte[]> response = restTemplate.exchange(
                        url, HttpMethod.POST, entity, byte[].class);

                if (response.getStatusCode().is2xxSuccessful()
                        && response.getBody() != null
                        && response.getBody().length > 1000) {

                    String base64 = Base64.getEncoder().encodeToString(response.getBody());
                    log.info("Image generated with HuggingFace model '{}', size={} bytes",
                            model, response.getBody().length);
                    return base64;
                }

                log.warn("HuggingFace model '{}' returned empty or too-small response", model);
            } catch (Exception e) {
                String msg = e.getMessage();
                if (msg != null && msg.contains("503")) {
                    log.warn("HuggingFace model '{}' is loading, trying next", model);
                } else if (msg != null && msg.contains("429")) {
                    log.warn("HuggingFace model '{}' rate limited, trying next", model);
                } else {
                    log.warn("HuggingFace model '{}' failed: {}", model,
                            msg != null ? msg.substring(0, Math.min(300, msg.length())) : "unknown");
                }
            }
        }

        throw new RuntimeException(
            "All HuggingFace image generation models failed. Please try again later.");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private String stripDataUriPrefix(String base64) {
        if (base64 != null && base64.contains(",")) {
            return base64.substring(base64.indexOf(",") + 1);
        }
        return base64;
    }

    private String guessMimeType(String base64) {
        try {
            byte[] header = Base64.getDecoder().decode(
                    base64.substring(0, Math.min(16, base64.length())));
            if (header.length >= 2 && header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) {
                return "image/jpeg";
            }
            if (header.length >= 4 && header[0] == (byte) 0x89 && header[1] == 0x50) {
                return "image/png";
            }
        } catch (Exception ignored) {}
        return "image/jpeg";
    }

    private String extractField(String prompt, String field) {
        try {
            for (String part : prompt.split("\\|")) {
                String trimmed = part.trim();
                if (trimmed.startsWith(field + "=")) {
                    return trimmed.substring(field.length() + 1).trim();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse field '{}' from prompt", field);
        }
        return switch (field) {
            case "style"  -> "REALISTIC";
            case "age"    -> "newborn";
            case "gender" -> "baby";
            default       -> "";
        };
    }
}
