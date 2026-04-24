package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Quiz grading result and updated patient progress")
public class QuizSubmissionResponse {
    private Long moduleId;
    private Long patientId;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double scorePercentage;
    private List<Long> correctQuestionIds;
    private UserProgressResponse progress;
}