package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Quiz submission answers keyed by question ID")
public class QuizSubmissionRequest {

    @NotEmpty
    @Schema(example = "{\"11\":\"Folic acid\",\"12\":\"true\"}")
    private Map<Long, String> answers;
}