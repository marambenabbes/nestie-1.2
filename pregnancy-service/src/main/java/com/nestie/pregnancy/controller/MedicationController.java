package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.MedicationDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medications")
@RequiredArgsConstructor
@Tag(name = "Medication Manager", description = "Medication tracking and reminders")
public class MedicationController {

    private final MedicationService medicationService;

    @PostMapping("/user/{userId}")
    @Operation(summary = "Add a new medication")
    public ResponseEntity<MedicationDTO.Response> create(
            @PathVariable Long userId,
            @Valid @RequestBody MedicationDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicationService.create(userId, request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get medications by user")
    public ResponseEntity<PageResponse<MedicationDTO.Response>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(medicationService.getByUserId(userId, page, size));
    }

    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active medications")
    public ResponseEntity<List<MedicationDTO.Response>> getActiveMedications(@PathVariable Long userId) {
        return ResponseEntity.ok(medicationService.getActiveMedications(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medication by ID")
    public ResponseEntity<MedicationDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicationService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update medication")
    public ResponseEntity<MedicationDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicationDTO.Request request) {
        return ResponseEntity.ok(medicationService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate medication")
    public ResponseEntity<MedicationDTO.Response> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(medicationService.deactivate(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete medication")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
