package com.nestie.education.dto;

import com.nestie.education.entity.QuizQuestion.QuestionType;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create or update a quiz question")
public class QuizQuestionRequest {

    @NotNull
    @Schema(example = "MULTIPLE_CHOICE", allowableValues = {"MULTIPLE_CHOICE", "TRUE_FALSE"})
    private QuestionType questionType;

    @NotBlank
    @Size(max = 1000)
    @Schema(example = "Which nutrient helps reduce the risk of neural tube defects during pregnancy?")
    private String questionText;

    @NotEmpty
    @ArraySchema(schema = @Schema(example = "Folic acid"))
    private List<String> answerOptions;

    @NotBlank
    @Schema(example = "Folic acid")
    private String correctAnswer;

    @Schema(example = "Folic acid is especially important before conception and during early pregnancy.")
    private String explanation;

    @Schema(example = "1")
    private Integer displayOrder;
}