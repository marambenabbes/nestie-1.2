package com.nestie.education.dto;

import com.nestie.education.entity.QuizQuestion.QuestionType;
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
@Schema(description = "Quiz question payload")
public class QuizQuestionResponse {
    private Long id;
    private Long moduleId;
    private QuestionType questionType;
    private String questionText;
    private List<String> answerOptions;
    private String correctAnswer;
    private String explanation;
    private Integer displayOrder;
}