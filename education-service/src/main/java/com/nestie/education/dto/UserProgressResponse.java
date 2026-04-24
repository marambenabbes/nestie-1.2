package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Patient progress for a learning module")
public class UserProgressResponse {
    private Long moduleId;
    private String moduleTitle;
    private String thumbnailUrl;
    private Long patientId;
    private Integer completionPercentage;
    private boolean completed;
    private Double quizScore;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private LocalDateTime lastViewedAt;
    private LocalDateTime completedAt;
}