package com.nestie.education.controller;

import com.nestie.education.dto.UserProgressResponse;
import com.nestie.education.service.AccessService;
import com.nestie.education.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/education/progress")
@RequiredArgsConstructor
@Tag(name = "Education Progress", description = "Patient learning progress tracking")
@SecurityRequirement(name = "bearerAuth")
public class ProgressController {

    private final ProgressService progressService;
    private final AccessService accessService;

    @GetMapping("/patients/{patientId}")
    @Operation(summary = "Get patient progress across modules")
    public ResponseEntity<List<UserProgressResponse>> getByPatient(
        @PathVariable Long patientId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "ADMIN");
        accessService.requirePatientOrAdmin(userId, role, patientId);
        return ResponseEntity.ok(progressService.getByPatient(patientId));
    }

    @GetMapping("/patients/{patientId}/modules/{moduleId}")
    @Operation(summary = "Get patient progress for a specific module")
    public ResponseEntity<UserProgressResponse> getByPatientAndModule(
        @PathVariable Long patientId,
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "ADMIN");
        accessService.requirePatientOrAdmin(userId, role, patientId);
        return ResponseEntity.ok(progressService.getByPatientAndModule(patientId, moduleId));
    }

    @PostMapping("/patients/{patientId}/modules/{moduleId}/viewed")
    @Operation(summary = "Mark module as viewed by patient")
    public ResponseEntity<UserProgressResponse> markViewed(
        @PathVariable Long patientId,
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "ADMIN");
        accessService.requirePatientOrAdmin(userId, role, patientId);
        return ResponseEntity.ok(progressService.markViewed(patientId, moduleId));
    }

    @PostMapping("/patients/{patientId}/modules/{moduleId}/complete")
    @Operation(summary = "Mark module as fully completed by patient")
    public ResponseEntity<UserProgressResponse> markCompleted(
        @PathVariable Long patientId,
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId) {
        accessService.requireRoles(role, "PATIENT", "ADMIN");
        accessService.requirePatientOrAdmin(userId, role, patientId);
        return ResponseEntity.ok(progressService.markCompleted(patientId, moduleId));
    }
}