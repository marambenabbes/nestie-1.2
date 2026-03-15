package com.nestie.appointment.dto;

import com.nestie.appointment.entity.Appointment.AppointmentStatus;
import com.nestie.appointment.entity.Appointment.AppointmentType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class AppointmentDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long doctorId;

        @NotNull(message = "Appointment date is required")
        private LocalDateTime appointmentDate;

        private String reason;
        private String notes;
        private String location;
        private AppointmentType type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private LocalDateTime appointmentDate;
        private String reason;
        private String notes;
        private AppointmentStatus status;
        private String location;
        private AppointmentType type;
        private LocalDateTime createdAt;
    }
}
