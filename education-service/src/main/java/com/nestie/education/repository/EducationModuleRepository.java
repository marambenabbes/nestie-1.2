package com.nestie.education.repository;

import com.nestie.education.entity.EducationModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationModuleRepository extends JpaRepository<EducationModule, Long> {
    List<EducationModule> findAllByOrderByCreatedAtDesc();
    List<EducationModule> findByPublishedTrueOrderByCreatedAtDesc();
}