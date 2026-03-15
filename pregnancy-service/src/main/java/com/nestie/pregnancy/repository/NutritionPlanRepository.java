package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.NutritionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {
    Page<NutritionPlan> findByUserId(Long userId, Pageable pageable);
    List<NutritionPlan> findByPregnancyId(Long pregnancyId);
}
