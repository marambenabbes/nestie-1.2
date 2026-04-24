package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.MedicationDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.entity.Medication;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.MedicationRepository;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    public MedicationDTO.Response create(Long userId, MedicationDTO.Request request) {
        Medication medication = Medication.builder()
            .userId(userId)
            .medicationName(request.getMedicationName())
            .dosage(request.getDosage())
            .frequency(request.getFrequency())
            .reminderTime(request.getReminderTime())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .prescribedBy(request.getPrescribedBy())
            .instructions(request.getInstructions())
            .sideEffects(request.getSideEffects())
            .active(true)
            .build();

        if (request.getPregnancyId() != null) {
            medication.setPregnancy(pregnancyProfileRepository.findById(request.getPregnancyId())
                .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", request.getPregnancyId())));
        }

        return mapToResponse(medicationRepository.save(medication));
    }

    public PageResponse<MedicationDTO.Response> getByUserId(Long userId, int page, int size) {
        Page<Medication> medications = medicationRepository.findByUserId(userId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return PageResponse.<MedicationDTO.Response>builder()
            .content(medications.getContent().stream().map(this::mapToResponse).toList())
            .page(medications.getNumber())
            .size(medications.getSize())
            .totalElements(medications.getTotalElements())
            .totalPages(medications.getTotalPages())
            .last(medications.isLast())
            .build();
    }

    public List<MedicationDTO.Response> getActiveMedications(Long userId) {
        return medicationRepository.findByUserIdAndActiveTrue(userId).stream()
            .map(this::mapToResponse).toList();
    }

    public MedicationDTO.Response getById(Long id) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        return mapToResponse(m);
    }

    public MedicationDTO.Response update(Long id, MedicationDTO.Request request) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));

        if (request.getMedicationName() != null) m.setMedicationName(request.getMedicationName());
        if (request.getDosage() != null) m.setDosage(request.getDosage());
        if (request.getFrequency() != null) m.setFrequency(request.getFrequency());
        if (request.getInstructions() != null) m.setInstructions(request.getInstructions());

        return mapToResponse(medicationRepository.save(m));
    }

    public MedicationDTO.Response deactivate(Long id) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        m.setActive(false);
        return mapToResponse(medicationRepository.save(m));
    }

    public MedicationDTO.Response activate(Long id) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        m.setActive(true);
        return mapToResponse(medicationRepository.save(m));
    }

    public void delete(Long id) {
        if (!medicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medication", "id", id);
        }
        medicationRepository.deleteById(id);
    }

    private MedicationDTO.Response mapToResponse(Medication m) {
        return MedicationDTO.Response.builder()
            .id(m.getId())
            .userId(m.getUserId())
            .medicationName(m.getMedicationName())
            .dosage(m.getDosage())
            .frequency(m.getFrequency())
            .reminderTime(m.getReminderTime())
            .startDate(m.getStartDate())
            .endDate(m.getEndDate())
            .prescribedBy(m.getPrescribedBy())
            .instructions(m.getInstructions())
            .sideEffects(m.getSideEffects())
            .active(m.isActive())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
