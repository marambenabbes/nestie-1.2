package com.nestie.pregnancy.dto;

import com.nestie.pregnancy.entity.Symptom.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class SymptomDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Symptom name is required")
        private String symptomName;

        @NotNull(message = "Severity is required")
        private Severity severity;

        private String description;

        @NotNull(message = "Occurrence time is required")
        private LocalDateTime occurredAt;

        private Integer durationMinutes;
        private Long pregnancyId;
        private Integer pregnancyWeek;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String symptomName;
        private Severity severity;
        private String description;
        private LocalDateTime occurredAt;
        private Integer durationMinutes;
        private Integer pregnancyWeek;
        private boolean flaggedByAI;
        private String aiRecommendation;
        private LocalDateTime createdAt;
    }
}
