package com.nestie.education.dto;

import com.nestie.education.entity.ModuleMedia.MediaType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Media asset attached to an education module")
public class ModuleMediaRequest {

    @NotNull
    @Schema(example = "VIDEO", allowableValues = {"VIDEO", "GIF", "IMAGE"})
    private MediaType type;

    @NotBlank
    @Schema(example = "https://cdn.nestie.app/education/breathing-exercise.mp4")
    private String url;

    @Schema(example = "Two-minute guided breathing tutorial")
    private String caption;

    @Schema(example = "1")
    private Integer displayOrder;
}