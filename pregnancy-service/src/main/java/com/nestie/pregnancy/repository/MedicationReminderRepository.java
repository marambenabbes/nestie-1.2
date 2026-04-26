package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.MedicationReminder;
import com.nestie.pregnancy.entity.MedicationReminder.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, Long> {

    List<MedicationReminder> findByUserIdAndStatusOrderByScheduledTimeAsc(Long userId, ReminderStatus status);

    List<MedicationReminder> findByUserIdAndScheduledTimeBetweenOrderByScheduledTimeAsc(
            Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM MedicationReminder r WHERE r.userId = :userId " +
           "AND r.scheduledTime >= :start AND r.scheduledTime <= :end " +
           "ORDER BY r.scheduledTime ASC")
    List<MedicationReminder> findUpcomingReminders(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT r FROM MedicationReminder r WHERE r.status = :status " +
           "AND r.scheduledTime <= :now")
    List<MedicationReminder> findDueReminders(
            @Param("status") ReminderStatus status,
            @Param("now") LocalDateTime now);

    List<MedicationReminder> findByMedicationIdOrderByScheduledTimeDesc(Long medicationId);
}
