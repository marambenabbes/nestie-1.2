package com.nestie.appointment.controller;

import com.nestie.appointment.dto.DoctorAdviceDTO;
import com.nestie.appointment.dto.PageResponse;
import com.nestie.appointment.service.DoctorAdviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/doctor-advice")
@RequiredArgsConstructor
@Tag(name = "Doctor Advice", description = "Doctor advice and recommendations for patients")
public class DoctorAdviceController {

    private final DoctorAdviceService adviceService;

    @PostMapping("/doctor/{doctorId}")
    @Operation(summary = "Create new advice for a patient")
    public ResponseEntity<DoctorAdviceDTO.Response> create(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorAdviceDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adviceService.create(doctorId, request));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get all advice for a patient")
    public ResponseEntity<PageResponse<DoctorAdviceDTO.Response>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adviceService.getByPatientId(patientId, page, size));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get all advice given by a doctor")
    public ResponseEntity<PageResponse<DoctorAdviceDTO.Response>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adviceService.getByDoctorId(doctorId, page, size));
    }

    @GetMapping("/doctor/{doctorId}/patient/{patientId}")
    @Operation(summary = "Get advice from a specific doctor for a specific patient")
    public ResponseEntity<PageResponse<DoctorAdviceDTO.Response>> getByDoctorAndPatient(
            @PathVariable Long doctorId,
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adviceService.getByDoctorAndPatient(doctorId, patientId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get advice by ID")
    public ResponseEntity<DoctorAdviceDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adviceService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update advice")
    public ResponseEntity<DoctorAdviceDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody DoctorAdviceDTO.Request request) {
        return ResponseEntity.ok(adviceService.update(id, request));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark advice as read by patient")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        adviceService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/patient/{patientId}/unread-count")
    @Operation(summary = "Get unread advice count for a patient")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long patientId) {
        return ResponseEntity.ok(Map.of("unreadCount", adviceService.getUnreadCount(patientId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete advice")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
