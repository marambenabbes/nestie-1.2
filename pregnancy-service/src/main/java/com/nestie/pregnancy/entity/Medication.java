package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "medications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregnancy_id")
    private PregnancyProfile pregnancy;

    @NotBlank
    private String medicationName;

    private String dosage;

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    private LocalTime reminderTime;

    private LocalDate startDate;

    private LocalDate endDate;

    private String prescribedBy;

    @Column(length = 500)
    private String instructions;

    @Column(length = 500)
    private String sideEffects;

    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Frequency {
        ONCE_DAILY, TWICE_DAILY, THREE_TIMES_DAILY, WEEKLY, AS_NEEDED
    }
}
