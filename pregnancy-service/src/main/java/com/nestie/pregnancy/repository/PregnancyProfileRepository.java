package com.nestie.pregnancy.repository;

import com.nestie.pregnancy.entity.PregnancyProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PregnancyProfileRepository extends JpaRepository<PregnancyProfile, Long> {
    List<PregnancyProfile> findByUserId(Long userId);
    Page<PregnancyProfile> findByUserId(Long userId, Pageable pageable);
    Optional<PregnancyProfile> findByUserIdAndStatus(Long userId, PregnancyProfile.PregnancyStatus status);
    List<PregnancyProfile> findByDoctorId(Long doctorId);
    Page<PregnancyProfile> findByDoctorId(Long doctorId, Pageable pageable);
}
