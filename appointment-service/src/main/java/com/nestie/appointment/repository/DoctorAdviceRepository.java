package com.nestie.appointment.repository;

import com.nestie.appointment.entity.DoctorAdvice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorAdviceRepository extends JpaRepository<DoctorAdvice, Long> {
    Page<DoctorAdvice> findByPatientId(Long patientId, Pageable pageable);
    Page<DoctorAdvice> findByDoctorId(Long doctorId, Pageable pageable);
    Page<DoctorAdvice> findByDoctorIdAndPatientId(Long doctorId, Long patientId, Pageable pageable);
    List<DoctorAdvice> findByPatientIdAndReadByPatientFalse(Long patientId);
    long countByPatientIdAndReadByPatientFalse(Long patientId);
}
