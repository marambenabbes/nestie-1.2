package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.NutritionPlanDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.entity.NutritionPlan;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.NutritionPlanRepository;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NutritionPlanService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    public NutritionPlanDTO.Response create(Long userId, NutritionPlanDTO.Request request) {
        NutritionPlan plan = NutritionPlan.builder()
            .userId(userId)
            .mealName(request.getMealName())
            .mealType(request.getMealType())
            .ingredients(request.getIngredients())
            .calories(request.getCalories())
            .proteinGrams(request.getProteinGrams())
            .carbsGrams(request.getCarbsGrams())
            .fatGrams(request.getFatGrams())
            .folicAcidMcg(request.getFolicAcidMcg())
            .ironMg(request.getIronMg())
            .calciumMg(request.getCalciumMg())
            .scheduledDate(request.getScheduledDate())
            .pregnancyWeek(request.getPregnancyWeek())
            .aiGenerated(Boolean.TRUE.equals(request.getAiGenerated()))
            .notes(sanitizeNotes(request.getNotes()))
            .build();

        if (request.getPregnancyId() != null) {
            plan.setPregnancy(pregnancyProfileRepository.findById(request.getPregnancyId())
                .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", request.getPregnancyId())));
        }

        return mapToResponse(nutritionPlanRepository.save(plan));
    }

    public PageResponse<NutritionPlanDTO.Response> getByUserId(Long userId, int page, int size) {
        Page<NutritionPlan> plans = nutritionPlanRepository.findByUserId(userId,
            PageRequest.of(page, size, Sort.by("scheduledDate").descending()));

        return PageResponse.<NutritionPlanDTO.Response>builder()
            .content(plans.getContent().stream().map(this::mapToResponse).toList())
            .page(plans.getNumber())
            .size(plans.getSize())
            .totalElements(plans.getTotalElements())
            .totalPages(plans.getTotalPages())
            .last(plans.isLast())
            .build();
    }

    public NutritionPlanDTO.Response getById(Long id) {
        NutritionPlan plan = nutritionPlanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("NutritionPlan", "id", id));
        return mapToResponse(plan);
    }

    public NutritionPlanDTO.Response update(Long id, NutritionPlanDTO.Request request) {
        NutritionPlan plan = nutritionPlanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("NutritionPlan", "id", id));

        if (request.getMealName() != null) plan.setMealName(request.getMealName());
        if (request.getMealType() != null) plan.setMealType(request.getMealType());
        if (request.getIngredients() != null) plan.setIngredients(request.getIngredients());
        if (request.getCalories() != null) plan.setCalories(request.getCalories());
        if (request.getProteinGrams() != null) plan.setProteinGrams(request.getProteinGrams());
        if (request.getCarbsGrams() != null) plan.setCarbsGrams(request.getCarbsGrams());
        if (request.getFatGrams() != null) plan.setFatGrams(request.getFatGrams());
        if (request.getFolicAcidMcg() != null) plan.setFolicAcidMcg(request.getFolicAcidMcg());
        if (request.getIronMg() != null) plan.setIronMg(request.getIronMg());
        if (request.getCalciumMg() != null) plan.setCalciumMg(request.getCalciumMg());
        if (request.getScheduledDate() != null) plan.setScheduledDate(request.getScheduledDate());
        if (request.getPregnancyWeek() != null) plan.setPregnancyWeek(request.getPregnancyWeek());
        if (request.getAiGenerated() != null) plan.setAiGenerated(request.getAiGenerated());
        if (request.getNotes() != null) plan.setNotes(sanitizeNotes(request.getNotes()));

        return mapToResponse(nutritionPlanRepository.save(plan));
    }

    private String sanitizeNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return notes;
        }

        return notes.codePoints()
            .filter(codePoint -> codePoint <= 0xFFFF)
            .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
            .toString()
            .trim();
    }

    public void delete(Long id) {
        if (!nutritionPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("NutritionPlan", "id", id);
        }
        nutritionPlanRepository.deleteById(id);
    }

    private NutritionPlanDTO.Response mapToResponse(NutritionPlan n) {
        return NutritionPlanDTO.Response.builder()
            .id(n.getId())
            .userId(n.getUserId())
            .mealName(n.getMealName())
            .mealType(n.getMealType())
            .ingredients(n.getIngredients())
            .calories(n.getCalories())
            .proteinGrams(n.getProteinGrams())
            .carbsGrams(n.getCarbsGrams())
            .fatGrams(n.getFatGrams())
            .folicAcidMcg(n.getFolicAcidMcg())
            .ironMg(n.getIronMg())
            .calciumMg(n.getCalciumMg())
            .scheduledDate(n.getScheduledDate())
            .pregnancyWeek(n.getPregnancyWeek())
            .aiGenerated(n.isAiGenerated())
            .notes(n.getNotes())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
