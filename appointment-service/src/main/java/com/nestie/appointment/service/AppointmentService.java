package com.nestie.appointment.service;

import com.nestie.appointment.dto.AppointmentDTO;
import com.nestie.appointment.dto.PageResponse;
import com.nestie.appointment.entity.Appointment;
import com.nestie.appointment.entity.Appointment.AppointmentStatus;
import com.nestie.appointment.exception.ResourceNotFoundException;
import com.nestie.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentDTO.Response create(Long patientId, AppointmentDTO.Request request) {
        Appointment appointment = Appointment.builder()
            .patientId(patientId)
            .doctorId(request.getDoctorId())
            .appointmentDate(request.getAppointmentDate())
            .reason(request.getReason())
            .notes(request.getNotes())
            .location(request.getLocation())
            .type(request.getType())
            .status(AppointmentStatus.SCHEDULED)
            .build();

        return mapToResponse(appointmentRepository.save(appointment));
    }

    public PageResponse<AppointmentDTO.Response> getByPatientId(Long patientId, int page, int size) {
        Page<Appointment> appointments = appointmentRepository.findByPatientId(patientId,
            PageRequest.of(page, size, Sort.by("appointmentDate").descending()));
        return buildPageResponse(appointments);
    }

    public PageResponse<AppointmentDTO.Response> getByDoctorId(Long doctorId, int page, int size) {
        Page<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId,
            PageRequest.of(page, size, Sort.by("appointmentDate").descending()));
        return buildPageResponse(appointments);
    }

    public AppointmentDTO.Response getById(Long id) {
        Appointment a = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapToResponse(a);
    }

    public AppointmentDTO.Response updateStatus(Long id, AppointmentStatus status) {
        Appointment a = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        a.setStatus(status);
        return mapToResponse(appointmentRepository.save(a));
    }

    public void delete(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        appointmentRepository.deleteById(id);
    }

    private AppointmentDTO.Response mapToResponse(Appointment a) {
        return AppointmentDTO.Response.builder()
            .id(a.getId())
            .patientId(a.getPatientId())
            .doctorId(a.getDoctorId())
            .appointmentDate(a.getAppointmentDate())
            .reason(a.getReason())
            .notes(a.getNotes())
            .status(a.getStatus())
            .location(a.getLocation())
            .type(a.getType())
            .createdAt(a.getCreatedAt())
            .build();
    }

    private PageResponse<AppointmentDTO.Response> buildPageResponse(Page<Appointment> page) {
        return PageResponse.<AppointmentDTO.Response>builder()
            .content(page.getContent().stream().map(this::mapToResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }
}
