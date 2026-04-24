package com.nestie.education.repository;

import com.nestie.education.entity.UserModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserModuleProgressRepository extends JpaRepository<UserModuleProgress, Long> {
    List<UserModuleProgress> findByPatientIdOrderByUpdatedAtDesc(Long patientId);
    List<UserModuleProgress> findByPatientIdAndModuleIdIn(Long patientId, List<Long> moduleIds);
    Optional<UserModuleProgress> findByPatientIdAndModuleId(Long patientId, Long moduleId);
}