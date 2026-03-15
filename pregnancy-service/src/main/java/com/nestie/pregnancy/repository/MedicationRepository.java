package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.Medication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    Page<Medication> findByUserId(Long userId, Pageable pageable);
    List<Medication> findByUserIdAndActiveTrue(Long userId);
    List<Medication> findByPregnancyId(Long pregnancyId);
}
