package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pregnancy_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PregnancyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    private LocalDate lastMenstrualPeriod;

    @NotNull
    private LocalDate expectedDueDate;

    private Integer currentWeek;

    private Integer currentTrimester;

    private String bloodType;

    private Double prePregnancyWeight;

    private Double currentWeight;

    private Double height;

    @Column(length = 500)
    private String medicalConditions;

    @Column(length = 500)
    private String allergies;

    @Enumerated(EnumType.STRING)
    private PregnancyStatus status;

    @Column(name = "doctor_id")
    private Long doctorId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PregnancyStatus {
        ACTIVE, DELIVERED, COMPLICATED, INACTIVE
    }
}
