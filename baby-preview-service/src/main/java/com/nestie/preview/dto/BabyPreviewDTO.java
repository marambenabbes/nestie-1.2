package com.nestie.preview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;

public class BabyPreviewDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Gender is required")
        @Pattern(regexp = "BOY|GIRL|NEUTRAL", message = "Gender must be BOY, GIRL, or NEUTRAL")
        private String gender;

        @NotBlank(message = "Age is required")
        @Pattern(regexp = "NEWBORN|SIX_MONTHS|ONE_YEAR|THREE_YEARS", message = "Age must be NEWBORN, SIX_MONTHS, ONE_YEAR, or THREE_YEARS")
        private String age;

        @Pattern(regexp = "REALISTIC|CARTOON|THREE_D", message = "Style must be REALISTIC, CARTOON, or THREE_D")
        private String style;

        @NotNull(message = "Mother photo is required")
        private String motherPhoto;

        @NotNull(message = "Father photo is required")
        private String fatherPhoto;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String gender;
        private String age;
        private String style;
        private String generatedImageBase64;
        private String promptUsed;
        private String status;
        private String errorMessage;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RateLimitInfo {
        private int dailyLimit;
        private int usedToday;
        private int remaining;
        private boolean canGenerate;
    }
}
