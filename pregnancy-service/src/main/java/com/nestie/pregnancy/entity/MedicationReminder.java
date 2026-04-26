package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_reminders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderStatus status = ReminderStatus.PENDING;

    private LocalDateTime takenAt;

    private LocalDateTime dismissedAt;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ReminderStatus {
        PENDING,      // Reminder scheduled but not yet due
        DUE,          // Reminder is due now
        TAKEN,        // Medication was taken
        MISSED,       // Reminder was missed
        DISMISSED,    // User dismissed the reminder
        SNOOZED       // User snoozed the reminder
    }
}
