package com.nestie.appointment.dto;

import com.nestie.appointment.entity.DoctorAdvice.AdviceCategory;
import com.nestie.appointment.entity.DoctorAdvice.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class DoctorAdviceDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Patient ID is required")
        private Long patientId;

        @NotNull(message = "Category is required")
        private AdviceCategory category;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        private String actionItems;

        private Priority priority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long doctorId;
        private String doctorName;
        private Long patientId;
        private String patientName;
        private AdviceCategory category;
        private String title;
        private String message;
        private String actionItems;
        private Priority priority;
        private boolean readByPatient;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
