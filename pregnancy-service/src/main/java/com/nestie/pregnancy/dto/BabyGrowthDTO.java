package com.nestie.pregnancy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BabyGrowthDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Pregnancy ID is required")
        private Long pregnancyId;

        @NotNull(message = "Week number is required")
        private Integer weekNumber;

        private Double weightGrams;
        private Double lengthCm;
        private Double headCircumferenceCm;
        private Double abdominalCircumferenceCm;
        private Double femurLengthCm;
        private Double heartRate;
        private String developmentNotes;
        private LocalDate recordedDate;
        private String aiComparison;
        private String growthPercentile;
        private String ultrasoundImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long pregnancyId;
        private Integer weekNumber;
        private Double weightGrams;
        private Double lengthCm;
        private Double headCircumferenceCm;
        private Double abdominalCircumferenceCm;
        private Double femurLengthCm;
        private Double heartRate;
        private String developmentNotes;
        private LocalDate recordedDate;
        private String aiComparison;
        private String growthPercentile;
        private String ultrasoundImageUrl;
        private LocalDateTime createdAt;
    }
}