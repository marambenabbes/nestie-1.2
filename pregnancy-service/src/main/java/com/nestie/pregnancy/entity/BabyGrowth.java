package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "baby_growth")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BabyGrowth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregnancy_id", nullable = false)
    private PregnancyProfile pregnancy;

    @NotNull
    private Integer weekNumber;

    private Double weightGrams;
    private Double lengthCm;
    private Double headCircumferenceCm;
    private Double abdominalCircumferenceCm;
    private Double femurLengthCm;
    private Double heartRate;

    @Column(length = 1000)
    private String developmentNotes;

    private LocalDate recordedDate;

    @Column(length = 500)
    private String aiComparison;

    private String growthPercentile;

    @Column(columnDefinition = "LONGTEXT")
    private String ultrasoundImageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
