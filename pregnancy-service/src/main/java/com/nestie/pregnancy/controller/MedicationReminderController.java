package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.MedicationReminderDTO;
import com.nestie.pregnancy.service.MedicationReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medication-reminders")
@RequiredArgsConstructor
@Tag(name = "Medication Reminders", description = "Medication reminder and alarm management")
public class MedicationReminderController {

    private final MedicationReminderService reminderService;

    @GetMapping("/user/{userId}/upcoming")
    @Operation(summary = "Get upcoming reminders for user", 
               description = "Get all upcoming medication reminders for the next X hours")
    public ResponseEntity<MedicationReminderDTO.UpcomingRemindersResponse> getUpcomingReminders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "24") int hoursAhead) {
        return ResponseEntity.ok(reminderService.getUpcomingReminders(userId, hoursAhead));
    }

    @GetMapping("/user/{userId}/today")
    @Operation(summary = "Get today's reminders", 
               description = "Get all medication reminders for today")
    public ResponseEntity<List<MedicationReminderDTO.Response>> getTodayReminders(@PathVariable Long userId) {
        return ResponseEntity.ok(reminderService.getTodayReminders(userId));
    }

    @PostMapping("/{reminderId}/take")
    @Operation(summary = "Mark reminder as taken", 
               description = "Mark a medication reminder as taken with optional notes")
    public ResponseEntity<MedicationReminderDTO.Response> markAsTaken(
            @PathVariable Long reminderId,
            @RequestBody(required = false) MedicationReminderDTO.MarkTakenRequest request) {
        String notes = request != null ? request.getNotes() : null;
        return ResponseEntity.ok(reminderService.markAsTaken(reminderId, notes));
    }

    @PostMapping("/{reminderId}/dismiss")
    @Operation(summary = "Dismiss reminder", 
               description = "Dismiss a medication reminder without taking it")
    public ResponseEntity<MedicationReminderDTO.Response> dismissReminder(@PathVariable Long reminderId) {
        return ResponseEntity.ok(reminderService.dismissReminder(reminderId));
    }

    @PostMapping("/{reminderId}/snooze")
    @Operation(summary = "Snooze reminder", 
               description = "Snooze a medication reminder for X minutes (default 15)")
    public ResponseEntity<MedicationReminderDTO.Response> snoozeReminder(
            @PathVariable Long reminderId,
            @RequestBody(required = false) MedicationReminderDTO.SnoozeRequest request) {
        int snoozeMinutes = request != null && request.getSnoozeMinutes() != null 
                ? request.getSnoozeMinutes() : 15;
        return ResponseEntity.ok(reminderService.snoozeReminder(reminderId, snoozeMinutes));
    }

    @GetMapping("/medication/{medicationId}/history")
    @Operation(summary = "Get reminder history", 
               description = "Get all past reminders for a specific medication")
    public ResponseEntity<List<MedicationReminderDTO.Response>> getReminderHistory(@PathVariable Long medicationId) {
        return ResponseEntity.ok(reminderService.getReminderHistory(medicationId));
    }
}
