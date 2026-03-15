package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.dto.PregnancyProfileDTO;
import com.nestie.pregnancy.service.PregnancyProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pregnancy-profiles")
@RequiredArgsConstructor
@Tag(name = "Pregnancy Profiles", description = "Pregnancy profile management")
public class PregnancyProfileController {

    private final PregnancyProfileService profileService;

    @PostMapping("/user/{userId}")
    @Operation(summary = "Create pregnancy profile for a user")
    public ResponseEntity<PregnancyProfileDTO.Response> create(
            @PathVariable Long userId,
            @Valid @RequestBody PregnancyProfileDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.create(userId, request));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get pregnancy profiles by user ID")
    public ResponseEntity<PageResponse<PregnancyProfileDTO.Response>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(profileService.getByUserId(userId, page, size));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get pregnancy profiles by doctor ID")
    public ResponseEntity<PageResponse<PregnancyProfileDTO.Response>> getByDoctorId(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(profileService.getByDoctorId(doctorId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pregnancy profile by ID")
    public ResponseEntity<PregnancyProfileDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update pregnancy profile")
    public ResponseEntity<PregnancyProfileDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody PregnancyProfileDTO.Request request) {
        return ResponseEntity.ok(profileService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete pregnancy profile")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        profileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
