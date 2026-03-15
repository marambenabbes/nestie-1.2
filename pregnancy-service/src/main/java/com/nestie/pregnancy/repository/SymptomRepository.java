package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.Symptom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<Symptom, Long> {
    Page<Symptom> findByUserId(Long userId, Pageable pageable);
    List<Symptom> findByPregnancyId(Long pregnancyId);
}
