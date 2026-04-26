package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.MedicationReminderDTO;
import com.nestie.pregnancy.entity.Medication;
import com.nestie.pregnancy.entity.MedicationReminder;
import com.nestie.pregnancy.entity.MedicationReminder.ReminderStatus;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.MedicationReminderRepository;
import com.nestie.pregnancy.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationReminderService {

    private final MedicationReminderRepository reminderRepository;
    private final MedicationRepository medicationRepository;

    /**
     * Generate reminders for a medication based on its frequency
     */
    @Transactional
    public void generateRemindersForMedication(Medication medication, int daysAhead) {
        if (!medication.isActive() || medication.getReminderTime() == null) {
            log.debug("Skipping reminder generation for inactive medication or no reminder time set: {}", medication.getId());
            return;
        }

        LocalDate startDate = medication.getStartDate() != null ? medication.getStartDate() : LocalDate.now();
        LocalDate endDate = medication.getEndDate() != null ? medication.getEndDate() : startDate.plusDays(daysAhead);
        LocalTime reminderTime = medication.getReminderTime();

        List<MedicationReminder> reminders = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<LocalTime> timesForDay = getTimesForFrequency(medication.getFrequency(), reminderTime);

            for (LocalTime time : timesForDay) {
                LocalDateTime scheduledTime = LocalDateTime.of(date, time);

                // Only create future reminders
                if (scheduledTime.isAfter(LocalDateTime.now())) {
                    MedicationReminder reminder = MedicationReminder.builder()
                            .medication(medication)
                            .userId(medication.getUserId())
                            .scheduledTime(scheduledTime)
                            .status(ReminderStatus.PENDING)
                            .build();
                    reminders.add(reminder);
                }
            }
        }

        if (!reminders.isEmpty()) {
            reminderRepository.saveAll(reminders);
            log.info("Generated {} reminders for medication {}", reminders.size(), medication.getId());
        }
    }

    /**
     * Get reminder times based on frequency
     */
    private List<LocalTime> getTimesForFrequency(Medication.Frequency frequency, LocalTime baseTime) {
        List<LocalTime> times = new ArrayList<>();

        switch (frequency) {
            case ONCE_DAILY:
                times.add(baseTime);
                break;
            case TWICE_DAILY:
                times.add(baseTime);
                times.add(baseTime.plusHours(12));
                break;
            case THREE_TIMES_DAILY:
                times.add(baseTime);
                times.add(baseTime.plusHours(8));
                times.add(baseTime.plusHours(16));
                break;
            case WEEKLY:
                // Only on the same day of week
                times.add(baseTime);
                break;
            case AS_NEEDED:
                // No automatic reminders
                break;
        }

        return times;
    }

    /**
     * Get upcoming reminders for a user
     */
    public MedicationReminderDTO.UpcomingRemindersResponse getUpcomingReminders(Long userId, int hoursAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusHours(hoursAhead);

        List<MedicationReminder> reminders = reminderRepository.findUpcomingReminders(userId, now, end);

        int dueNow = 0;
        int dueSoon = 0;
        LocalDateTime soonThreshold = now.plusMinutes(30);

        for (MedicationReminder reminder : reminders) {
            if (reminder.getScheduledTime().isBefore(now.plusMinutes(5))) {
                dueNow++;
            } else if (reminder.getScheduledTime().isBefore(soonThreshold)) {
                dueSoon++;
            }
        }

        return MedicationReminderDTO.UpcomingRemindersResponse.builder()
                .totalUpcoming(reminders.size())
                .dueNow(dueNow)
                .dueSoon(dueSoon)
                .reminders(reminders.stream().map(this::mapToResponse).toList())
                .build();
    }

    /**
     * Get today's reminders for a user
     */
    public List<MedicationReminderDTO.Response> getTodayReminders(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);

        return reminderRepository.findByUserIdAndScheduledTimeBetweenOrderByScheduledTimeAsc(userId, startOfDay, endOfDay)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Mark reminder as taken
     */
    @Transactional
    public MedicationReminderDTO.Response markAsTaken(Long reminderId, String notes) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", reminderId));

        reminder.setStatus(ReminderStatus.TAKEN);
        reminder.setTakenAt(LocalDateTime.now());
        if (notes != null) {
            reminder.setNotes(notes);
        }

        return mapToResponse(reminderRepository.save(reminder));
    }

    /**
     * Dismiss a reminder
     */
    @Transactional
    public MedicationReminderDTO.Response dismissReminder(Long reminderId) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", reminderId));

        reminder.setStatus(ReminderStatus.DISMISSED);
        reminder.setDismissedAt(LocalDateTime.now());

        return mapToResponse(reminderRepository.save(reminder));
    }

    /**
     * Snooze a reminder
     */
    @Transactional
    public MedicationReminderDTO.Response snoozeReminder(Long reminderId, int snoozeMinutes) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicationReminder", "id", reminderId));

        // Create a new snoozed reminder
        MedicationReminder snoozedReminder = MedicationReminder.builder()
                .medication(reminder.getMedication())
                .userId(reminder.getUserId())
                .scheduledTime(LocalDateTime.now().plusMinutes(snoozeMinutes))
                .status(ReminderStatus.SNOOZED)
                .build();

        // Mark original as dismissed
        reminder.setStatus(ReminderStatus.DISMISSED);
        reminder.setDismissedAt(LocalDateTime.now());
        reminderRepository.save(reminder);

        return mapToResponse(reminderRepository.save(snoozedReminder));
    }

    /**
     * Scheduled task to update reminder statuses
     * Runs every minute
     */
    @Scheduled(cron = "0 * * * * *") // Every minute
    @Transactional
    public void updateReminderStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // Find pending reminders that are now due
        List<MedicationReminder> dueReminders = reminderRepository.findDueReminders(ReminderStatus.PENDING, now);

        for (MedicationReminder reminder : dueReminders) {
            reminder.setStatus(ReminderStatus.DUE);
        }

        if (!dueReminders.isEmpty()) {
            reminderRepository.saveAll(dueReminders);
            log.info("Updated {} reminders to DUE status", dueReminders.size());
        }

        // Mark reminders as missed if they're more than 1 hour overdue
        LocalDateTime missedThreshold = now.minusHours(1);
        List<MedicationReminder> missedReminders = reminderRepository.findDueReminders(ReminderStatus.DUE, missedThreshold);

        for (MedicationReminder reminder : missedReminders) {
            if (reminder.getScheduledTime().isBefore(missedThreshold)) {
                reminder.setStatus(ReminderStatus.MISSED);
            }
        }

        if (!missedReminders.isEmpty()) {
            reminderRepository.saveAll(missedReminders);
            log.info("Marked {} reminders as MISSED", missedReminders.size());
        }
    }

    /**
     * Get reminder history for a medication
     */
    public List<MedicationReminderDTO.Response> getReminderHistory(Long medicationId) {
        return reminderRepository.findByMedicationIdOrderByScheduledTimeDesc(medicationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MedicationReminderDTO.Response mapToResponse(MedicationReminder r) {
        return MedicationReminderDTO.Response.builder()
                .id(r.getId())
                .medicationId(r.getMedication().getId())
                .medicationName(r.getMedication().getMedicationName())
                .dosage(r.getMedication().getDosage())
                .scheduledTime(r.getScheduledTime())
                .status(r.getStatus())
                .takenAt(r.getTakenAt())
                .dismissedAt(r.getDismissedAt())
                .notes(r.getNotes())
                .instructions(r.getMedication().getInstructions())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
