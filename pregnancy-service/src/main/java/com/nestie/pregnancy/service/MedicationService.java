package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.MedicationDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.entity.Medication;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.MedicationRepository;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final MedicationReminderService reminderService;

    @Transactional
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

        Medication savedMedication = medicationRepository.save(medication);

        // Auto-generate reminders for the next 30 days
        if (savedMedication.getReminderTime() != null && savedMedication.isActive()) {
            try {
                reminderService.generateRemindersForMedication(savedMedication, 30);
                log.info("Generated reminders for medication {}", savedMedication.getId());
            } catch (Exception e) {
                log.error("Failed to generate reminders for medication {}", savedMedication.getId(), e);
                // Don't fail the medication creation if reminder generation fails
            }
        }

        return mapToResponse(savedMedication);
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

    @Transactional
    public MedicationDTO.Response update(Long id, MedicationDTO.Request request) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));

        boolean reminderChanged = false;

        if (request.getMedicationName() != null) m.setMedicationName(request.getMedicationName());
        if (request.getDosage() != null) m.setDosage(request.getDosage());
        if (request.getFrequency() != null) {
            m.setFrequency(request.getFrequency());
            reminderChanged = true;
        }
        if (request.getReminderTime() != null) {
            m.setReminderTime(request.getReminderTime());
            reminderChanged = true;
        }
        if (request.getInstructions() != null) m.setInstructions(request.getInstructions());
        if (request.getStartDate() != null) {
            m.setStartDate(request.getStartDate());
            reminderChanged = true;
        }
        if (request.getEndDate() != null) {
            m.setEndDate(request.getEndDate());
            reminderChanged = true;
        }

        Medication savedMedication = medicationRepository.save(m);

        // Regenerate reminders if schedule changed
        if (reminderChanged && savedMedication.getReminderTime() != null && savedMedication.isActive()) {
            try {
                reminderService.generateRemindersForMedication(savedMedication, 30);
                log.info("Regenerated reminders for medication {}", savedMedication.getId());
            } catch (Exception e) {
                log.error("Failed to regenerate reminders for medication {}", savedMedication.getId(), e);
            }
        }

        return mapToResponse(savedMedication);
    }

    public MedicationDTO.Response deactivate(Long id) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        m.setActive(false);
        return mapToResponse(medicationRepository.save(m));
    }

    @Transactional
    public MedicationDTO.Response activate(Long id) {
        Medication m = medicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        m.setActive(true);

        Medication savedMedication = medicationRepository.save(m);

        // Generate reminders when reactivating
        if (savedMedication.getReminderTime() != null) {
            try {
                reminderService.generateRemindersForMedication(savedMedication, 30);
                log.info("Generated reminders for reactivated medication {}", savedMedication.getId());
            } catch (Exception e) {
                log.error("Failed to generate reminders for reactivated medication {}", savedMedication.getId(), e);
            }
        }

        return mapToResponse(savedMedication);
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
