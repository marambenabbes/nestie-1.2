package com.nestie.pregnancy.dto;

import com.nestie.pregnancy.entity.Medication.Frequency;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class MedicationDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Medication name is required")
        private String medicationName;

        private String dosage;
        private Frequency frequency;
        private LocalTime reminderTime;
        private LocalDate startDate;
        private LocalDate endDate;
        private String prescribedBy;
        private String instructions;
        private String sideEffects;
        private Long pregnancyId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String medicationName;
        private String dosage;
        private Frequency frequency;
        private LocalTime reminderTime;
        private LocalDate startDate;
        private LocalDate endDate;
        private String prescribedBy;
        private String instructions;
        private String sideEffects;
        private boolean active;
        private LocalDateTime createdAt;
    }
}
