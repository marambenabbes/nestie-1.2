package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
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
@Schema(description = "Create or update an education module")
public class EducationModuleRequest {

    @NotBlank
    @Size(max = 150)
    @Schema(example = "Healthy Eating During The Second Trimester")
    private String title;

    @NotBlank
    @Size(max = 2000)
    @Schema(example = "A practical guide to balanced meals, hydration, and nutrient-rich snacks for weeks 13 to 27.")
    private String description;

    @NotBlank
    @Size(max = 5000)
    @Schema(example = "Start your day with protein and fiber. Keep iron-rich foods in lunch and pair them with vitamin C to improve absorption.")
    private String instructions;

    @Schema(example = "https://images.unsplash.com/photo-1547592180-85f173990554")
    private String thumbnailUrl;

    @NotNull
    @Schema(example = "12")
    private Integer estimatedMinutes;

    @NotNull
    @Schema(example = "true")
    private Boolean published;

    @Valid
    @NotEmpty
    private List<ModuleMediaRequest> mediaItems;
}