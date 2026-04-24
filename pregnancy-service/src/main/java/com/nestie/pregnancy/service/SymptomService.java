package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.dto.SymptomDTO;
import com.nestie.pregnancy.entity.Symptom;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import com.nestie.pregnancy.repository.SymptomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SymptomService {

    private final SymptomRepository symptomRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    public SymptomDTO.Response create(Long userId, SymptomDTO.Request request) {
        Symptom symptom = Symptom.builder()
            .userId(userId)
            .symptomName(request.getSymptomName())
            .severity(request.getSeverity())
            .description(request.getDescription())
            .occurredAt(request.getOccurredAt())
            .durationMinutes(request.getDurationMinutes())
            .pregnancyWeek(request.getPregnancyWeek())
            .build();

        if (request.getPregnancyId() != null) {
            symptom.setPregnancy(pregnancyProfileRepository.findById(request.getPregnancyId())
                .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", request.getPregnancyId())));
        }

        return mapToResponse(symptomRepository.save(symptom));
    }

    public PageResponse<SymptomDTO.Response> getByUserId(Long userId, int page, int size) {
        Page<Symptom> symptoms = symptomRepository.findByUserId(userId,
            PageRequest.of(page, size, Sort.by("occurredAt").descending()));

        return PageResponse.<SymptomDTO.Response>builder()
            .content(symptoms.getContent().stream().map(this::mapToResponse).toList())
            .page(symptoms.getNumber())
            .size(symptoms.getSize())
            .totalElements(symptoms.getTotalElements())
            .totalPages(symptoms.getTotalPages())
            .last(symptoms.isLast())
            .build();
    }

    public SymptomDTO.Response getById(Long id) {
        Symptom s = symptomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Symptom", "id", id));
        return mapToResponse(s);
    }

    public SymptomDTO.Response update(Long id, SymptomDTO.Request request) {
        Symptom s = symptomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Symptom", "id", id));

        if (request.getSymptomName() != null) s.setSymptomName(request.getSymptomName());
        if (request.getSeverity() != null) s.setSeverity(request.getSeverity());
        if (request.getDescription() != null) s.setDescription(request.getDescription());

        return mapToResponse(symptomRepository.save(s));
    }

    public void delete(Long id) {
        if (!symptomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Symptom", "id", id);
        }
        symptomRepository.deleteById(id);
    }

    private SymptomDTO.Response mapToResponse(Symptom s) {
        return SymptomDTO.Response.builder()
            .id(s.getId())
            .userId(s.getUserId())
            .symptomName(s.getSymptomName())
            .severity(s.getSeverity())
            .description(s.getDescription())
            .occurredAt(s.getOccurredAt())
            .durationMinutes(s.getDurationMinutes())
            .pregnancyWeek(s.getPregnancyWeek())
            .flaggedByAI(s.isFlaggedByAI())
            .aiRecommendation(s.getAiRecommendation())
            .createdAt(s.getCreatedAt())
            .build();
    }
}
