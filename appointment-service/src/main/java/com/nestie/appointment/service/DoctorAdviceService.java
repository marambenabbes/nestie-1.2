package com.nestie.appointment.service;

import com.nestie.appointment.dto.DoctorAdviceDTO;
import com.nestie.appointment.dto.PageResponse;
import com.nestie.appointment.entity.DoctorAdvice;
import com.nestie.appointment.exception.ResourceNotFoundException;
import com.nestie.appointment.repository.DoctorAdviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorAdviceService {

    private final DoctorAdviceRepository adviceRepository;

    public DoctorAdviceDTO.Response create(Long doctorId, DoctorAdviceDTO.Request request) {
        DoctorAdvice advice = DoctorAdvice.builder()
            .doctorId(doctorId)
            .patientId(request.getPatientId())
            .category(request.getCategory())
            .title(request.getTitle())
            .message(request.getMessage())
            .actionItems(request.getActionItems())
            .priority(request.getPriority() != null ? request.getPriority() : DoctorAdvice.Priority.NORMAL)
            .readByPatient(false)
            .build();

        return mapToResponse(adviceRepository.save(advice));
    }

    public PageResponse<DoctorAdviceDTO.Response> getByPatientId(Long patientId, int page, int size) {
        Page<DoctorAdvice> advicePage = adviceRepository.findByPatientId(patientId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(advicePage);
    }

    public PageResponse<DoctorAdviceDTO.Response> getByDoctorId(Long doctorId, int page, int size) {
        Page<DoctorAdvice> advicePage = adviceRepository.findByDoctorId(doctorId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(advicePage);
    }

    public PageResponse<DoctorAdviceDTO.Response> getByDoctorAndPatient(Long doctorId, Long patientId, int page, int size) {
        Page<DoctorAdvice> advicePage = adviceRepository.findByDoctorIdAndPatientId(doctorId, patientId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPageResponse(advicePage);
    }

    public DoctorAdviceDTO.Response getById(Long id) {
        DoctorAdvice advice = adviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DoctorAdvice", "id", id));
        return mapToResponse(advice);
    }

    public DoctorAdviceDTO.Response update(Long id, DoctorAdviceDTO.Request request) {
        DoctorAdvice advice = adviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DoctorAdvice", "id", id));

        if (request.getCategory() != null) advice.setCategory(request.getCategory());
        if (request.getTitle() != null) advice.setTitle(request.getTitle());
        if (request.getMessage() != null) advice.setMessage(request.getMessage());
        if (request.getActionItems() != null) advice.setActionItems(request.getActionItems());
        if (request.getPriority() != null) advice.setPriority(request.getPriority());

        return mapToResponse(adviceRepository.save(advice));
    }

    public void markAsRead(Long id) {
        DoctorAdvice advice = adviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DoctorAdvice", "id", id));
        advice.setReadByPatient(true);
        adviceRepository.save(advice);
    }

    public long getUnreadCount(Long patientId) {
        return adviceRepository.countByPatientIdAndReadByPatientFalse(patientId);
    }

    public void delete(Long id) {
        if (!adviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("DoctorAdvice", "id", id);
        }
        adviceRepository.deleteById(id);
    }

    private PageResponse<DoctorAdviceDTO.Response> toPageResponse(Page<DoctorAdvice> page) {
        return PageResponse.<DoctorAdviceDTO.Response>builder()
            .content(page.getContent().stream().map(this::mapToResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }

    private DoctorAdviceDTO.Response mapToResponse(DoctorAdvice a) {
        return DoctorAdviceDTO.Response.builder()
            .id(a.getId())
            .doctorId(a.getDoctorId())
            .patientId(a.getPatientId())
            .category(a.getCategory())
            .title(a.getTitle())
            .message(a.getMessage())
            .actionItems(a.getActionItems())
            .priority(a.getPriority())
            .readByPatient(a.isReadByPatient())
            .createdAt(a.getCreatedAt())
            .updatedAt(a.getUpdatedAt())
            .build();
    }
}
