package com.nestie.education.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_module_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"patient_id", "module_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private EducationModule module;

    @Builder.Default
    @Column(nullable = false)
    private Integer completionPercentage = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = false;

    private Double quizScore;

    private Integer correctAnswers;

    private Integer totalQuestions;

    private LocalDateTime lastViewedAt;

    private LocalDateTime completedAt;

    private LocalDateTime updatedAt;
}