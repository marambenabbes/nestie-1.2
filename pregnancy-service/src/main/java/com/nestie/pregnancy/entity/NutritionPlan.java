package com.nestie.pregnancy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutritionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregnancy_id")
    private PregnancyProfile pregnancy;

    @NotBlank
    private String mealName;

    @Enumerated(EnumType.STRING)
    private MealType mealType;

    @Column(length = 2000)
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
    private boolean aiGenerated = false;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SNACK, SUPPLEMENT
    }
}
