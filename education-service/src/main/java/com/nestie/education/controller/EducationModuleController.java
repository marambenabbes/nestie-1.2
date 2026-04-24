package com.nestie.education.controller;

import com.nestie.education.dto.EducationModuleRequest;
import com.nestie.education.dto.EducationModuleResponse;
import com.nestie.education.service.AccessService;
import com.nestie.education.service.EducationModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/education/modules")
@RequiredArgsConstructor
@Tag(name = "Education Modules", description = "Education content delivery and module administration")
@SecurityRequirement(name = "bearerAuth")
public class EducationModuleController {

    private final EducationModuleService moduleService;
    private final AccessService accessService;

    @PostMapping
    @Operation(
        summary = "Create education module",
        description = "Doctor/Admin endpoint for creating a module with media assets.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                examples = @ExampleObject(
                    name = "Create module example",
                    value = "{\n  \"title\": \"Healthy Eating During The Second Trimester\",\n  \"description\": \"A practical guide to balanced meals, hydration, and nutrient-rich snacks.\",\n  \"instructions\": \"Start with breakfast rich in protein and keep iron-rich foods in lunch.\",\n  \"thumbnailUrl\": \"https://images.unsplash.com/photo-1547592180-85f173990554\",\n  \"estimatedMinutes\": 12,\n  \"published\": true,\n  \"mediaItems\": [\n    {\"type\": \"VIDEO\", \"url\": \"https://cdn.nestie.app/videos/trimester-two.mp4\", \"caption\": \"Doctor walkthrough\", \"displayOrder\": 1},\n    {\"type\": \"GIF\", \"url\": \"https://cdn.nestie.app/gifs/hydration.gif\", \"caption\": \"Hydration reminder\", \"displayOrder\": 2},\n    {\"type\": \"IMAGE\", \"url\": \"https://cdn.nestie.app/images/meal-plan.jpg\", \"caption\": \"Meal plan cheat sheet\", \"displayOrder\": 3}\n  ]\n}"
                )
            )
        ),
        responses = {
            @ApiResponse(responseCode = "201", description = "Module created"),
            @ApiResponse(responseCode = "403", description = "Doctor/Admin role required")
        }
    )
    public ResponseEntity<EducationModuleResponse> create(
        @RequestHeader("X-User-Role") String role,
        @Valid @RequestBody EducationModuleRequest request) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.create(request));
    }

    @GetMapping
    @Operation(summary = "List modules for current patient", description = "Returns published modules and embeds the current patient's progress.")
    public ResponseEntity<List<EducationModuleResponse>> getForPatient(
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "DOCTOR", "ADMIN");
        return ResponseEntity.ok(moduleService.getPublishedModulesForPatient(accessService.requireUserId(userId)));
    }

    @GetMapping("/admin")
    @Operation(summary = "List all modules for doctor/admin")
    public ResponseEntity<List<EducationModuleResponse>> getForAdmin(@RequestHeader("X-User-Role") String role) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @GetMapping("/{moduleId}")
    @Operation(summary = "Get module detail for current patient")
    public ResponseEntity<EducationModuleResponse> getForPatientById(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "DOCTOR", "ADMIN");
        return ResponseEntity.ok(moduleService.getModuleForPatient(moduleId, accessService.requireUserId(userId)));
    }

    @GetMapping("/admin/{moduleId}")
    @Operation(summary = "Get module detail for doctor/admin")
    public ResponseEntity<EducationModuleResponse> getForAdminById(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.ok(moduleService.getModuleForAdmin(moduleId));
    }

    @PutMapping("/{moduleId}")
    @Operation(summary = "Update education module")
    public ResponseEntity<EducationModuleResponse> update(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @Valid @RequestBody EducationModuleRequest request) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.ok(moduleService.update(moduleId, request));
    }

    @DeleteMapping("/{moduleId}")
    @Operation(summary = "Delete education module")
    public ResponseEntity<Void> delete(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        moduleService.delete(moduleId);
        return ResponseEntity.noContent().build();
    }
}