package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "symptoms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Symptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregnancy_id")
    private PregnancyProfile pregnancy;

    @NotBlank
    private String symptomName;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(length = 1000)
    private String description;

    @NotNull
    private LocalDateTime occurredAt;

    private Integer durationMinutes;

    private Integer pregnancyWeek;

    @Column(name = "flagged_by_ai")
    private boolean flaggedByAI = false;

    @Column(name = "ai_recommendation", length = 500)
    private String aiRecommendation;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Severity {
        MILD, MODERATE, SEVERE, CRITICAL
    }
}
