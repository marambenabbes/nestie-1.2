package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.NutritionPlanDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.service.NutritionPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/nutrition")
@RequiredArgsConstructor
@Tag(name = "Nutrition Planner", description = "Pregnancy nutrition planning and tracking")
public class NutritionPlanController {

    private final NutritionPlanService nutritionPlanService;

    @PostMapping("/user/{userId}")
    @Operation(summary = "Create nutrition plan entry")
    public ResponseEntity<NutritionPlanDTO.Response> create(
            @PathVariable Long userId,
            @Valid @RequestBody NutritionPlanDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nutritionPlanService.create(userId, request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get nutrition plans by user")
    public ResponseEntity<PageResponse<NutritionPlanDTO.Response>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(nutritionPlanService.getByUserId(userId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get nutrition plan by ID")
    public ResponseEntity<NutritionPlanDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(nutritionPlanService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update nutrition plan")
    public ResponseEntity<NutritionPlanDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody NutritionPlanDTO.Request request) {
        return ResponseEntity.ok(nutritionPlanService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete nutrition plan")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        nutritionPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
