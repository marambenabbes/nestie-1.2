package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Education module payload")
public class EducationModuleResponse {
    private Long id;
    private String title;
    private String description;
    private String instructions;
    private String thumbnailUrl;
    private Integer estimatedMinutes;
    private boolean published;
    private Integer quizCount;
    private List<ModuleMediaResponse> mediaItems;
    private UserProgressResponse progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}