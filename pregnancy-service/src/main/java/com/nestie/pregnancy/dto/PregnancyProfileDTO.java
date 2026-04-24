package com.nestie.pregnancy.dto;

import com.nestie.pregnancy.entity.PregnancyProfile.PregnancyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PregnancyProfileDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Last menstrual period date is required")
        private LocalDate lastMenstrualPeriod;

        @NotNull(message = "Expected due date is required")
        private LocalDate expectedDueDate;

        private String bloodType;
        private Double prePregnancyWeight;
        private Double currentWeight;
        private Double height;
        private String medicalConditions;
        private String allergies;
        private Long doctorId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private LocalDate lastMenstrualPeriod;
        private LocalDate expectedDueDate;
        private Integer currentWeek;
        private Integer currentTrimester;
        private String bloodType;
        private Double prePregnancyWeight;
        private Double currentWeight;
        private Double height;
        private String medicalConditions;
        private String allergies;
        private PregnancyStatus status;
        private Long doctorId;
        private String doctorName;
        private LocalDateTime createdAt;
    }
}
