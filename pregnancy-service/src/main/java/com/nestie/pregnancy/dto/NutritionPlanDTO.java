package com.nestie.pregnancy.dto;

import com.nestie.pregnancy.entity.NutritionPlan.MealType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class NutritionPlanDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Meal name is required")
        private String mealName;

        private MealType mealType;
        private String ingredients;
        private Integer calories;
        private Double proteinGrams;
        private Double carbsGrams;
        private Double fatGrams;
        private Double folicAcidMcg;
        private Double ironMg;
        private Double calciumMg;
        private LocalDate scheduledDate;
        private Long pregnancyId;
        private Integer pregnancyWeek;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String mealName;
        private MealType mealType;
        private String ingredients;
        private Integer calories;
        private Double proteinGrams;
        private Double carbsGrams;
        private Double fatGrams;
        private Double folicAcidMcg;
        private Double ironMg;
        private Double calciumMg;
        private LocalDate scheduledDate;
        private Integer pregnancyWeek;
        private boolean aiGenerated;
        private String notes;
        private LocalDateTime createdAt;
    }
}
