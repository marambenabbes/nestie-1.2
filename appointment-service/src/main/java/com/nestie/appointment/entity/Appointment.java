package com.nestie.appointment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id")
    private Long doctorId;

    @NotNull
    private LocalDateTime appointmentDate;

    @Column(length = 500)
    private String reason;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    private String location;

    @Enumerated(EnumType.STRING)
    private AppointmentType type;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum AppointmentStatus {
        SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    }

    public enum AppointmentType {
        CHECKUP, ULTRASOUND, LAB_WORK, EMERGENCY, CONSULTATION
    }
}
