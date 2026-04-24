package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.dto.SymptomDTO;
import com.nestie.pregnancy.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/symptoms")
@RequiredArgsConstructor
@Tag(name = "Symptoms Tracker", description = "Track and manage pregnancy symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    @PostMapping("/user/{userId}")
    @Operation(summary = "Log a new symptom")
    public ResponseEntity<SymptomDTO.Response> create(
            @PathVariable Long userId,
            @Valid @RequestBody SymptomDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(symptomService.create(userId, request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get symptoms by user")
    public ResponseEntity<PageResponse<SymptomDTO.Response>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(symptomService.getByUserId(userId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get symptom by ID")
    public ResponseEntity<SymptomDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(symptomService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update symptom")
    public ResponseEntity<SymptomDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody SymptomDTO.Request request) {
        return ResponseEntity.ok(symptomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete symptom")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        symptomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
