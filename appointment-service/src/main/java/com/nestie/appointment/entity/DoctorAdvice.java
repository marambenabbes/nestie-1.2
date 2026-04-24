package com.nestie.appointment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_advice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAdvice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdviceCategory category;

    @NotBlank
    @Column(length = 200)
    private String title;

    @NotBlank
    @Column(length = 2000)
    private String message;

    @Column(length = 500)
    private String actionItems;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(name = "read_by_patient")
    private boolean readByPatient = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AdviceCategory {
        NUTRITION, SYMPTOMS, MEDICATION, BABY_GROWTH, GENERAL
    }

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }
}
