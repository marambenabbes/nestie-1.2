package com.nestie.pregnancy.dto;

import com.nestie.pregnancy.entity.MedicationReminder.ReminderStatus;
import lombok.*;

import java.time.LocalDateTime;

public class MedicationReminderDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long medicationId;
        private String medicationName;
        private String dosage;
        private LocalDateTime scheduledTime;
        private ReminderStatus status;
        private LocalDateTime takenAt;
        private LocalDateTime dismissedAt;
        private String notes;
        private String instructions;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkTakenRequest {
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SnoozeRequest {
        private Integer snoozeMinutes = 15; // Default 15 minutes
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingRemindersResponse {
        private int totalUpcoming;
        private int dueNow;
        private int dueSoon; // Next 30 minutes
        private java.util.List<Response> reminders;
    }
}
