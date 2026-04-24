package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.BabyGrowth;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BabyGrowthRepository extends JpaRepository<BabyGrowth, Long> {
    List<BabyGrowth> findByPregnancyIdOrderByWeekNumberAsc(Long pregnancyId);
    Page<BabyGrowth> findByPregnancyId(Long pregnancyId, Pageable pageable);
    Optional<BabyGrowth> findByPregnancyIdAndWeekNumber(Long pregnancyId, Integer weekNumber);
}
