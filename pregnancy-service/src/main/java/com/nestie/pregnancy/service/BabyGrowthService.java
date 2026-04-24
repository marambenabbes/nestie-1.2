package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.BabyGrowthDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.entity.BabyGrowth;
import com.nestie.pregnancy.entity.PregnancyProfile;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.BabyGrowthRepository;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BabyGrowthService {

    private final BabyGrowthRepository babyGrowthRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    public BabyGrowthDTO.Response create(BabyGrowthDTO.Request request) {
        PregnancyProfile pregnancy = pregnancyProfileRepository.findById(request.getPregnancyId())
            .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", request.getPregnancyId()));

        BabyGrowth growth = BabyGrowth.builder()
            .pregnancy(pregnancy)
            .weekNumber(request.getWeekNumber())
            .weightGrams(request.getWeightGrams())
            .lengthCm(request.getLengthCm())
            .headCircumferenceCm(request.getHeadCircumferenceCm())
            .abdominalCircumferenceCm(request.getAbdominalCircumferenceCm())
            .femurLengthCm(request.getFemurLengthCm())
            .heartRate(request.getHeartRate())
            .developmentNotes(request.getDevelopmentNotes())
            .recordedDate(request.getRecordedDate())
            .aiComparison(request.getAiComparison())
            .growthPercentile(request.getGrowthPercentile())
            .ultrasoundImageUrl(request.getUltrasoundImageUrl())
            .build();

        return mapToResponse(babyGrowthRepository.save(growth));
    }

    public List<BabyGrowthDTO.Response> getByPregnancyId(Long pregnancyId) {
        return babyGrowthRepository.findByPregnancyIdOrderByWeekNumberAsc(pregnancyId)
            .stream().map(this::mapToResponse).toList();
    }

    public PageResponse<BabyGrowthDTO.Response> getByPregnancyIdPaged(Long pregnancyId, int page, int size) {
        Page<BabyGrowth> growths = babyGrowthRepository.findByPregnancyId(pregnancyId,
            PageRequest.of(page, size, Sort.by("weekNumber").ascending()));

        return PageResponse.<BabyGrowthDTO.Response>builder()
            .content(growths.getContent().stream().map(this::mapToResponse).toList())
            .page(growths.getNumber())
            .size(growths.getSize())
            .totalElements(growths.getTotalElements())
            .totalPages(growths.getTotalPages())
            .last(growths.isLast())
            .build();
    }

    public BabyGrowthDTO.Response getById(Long id) {
        BabyGrowth g = babyGrowthRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BabyGrowth", "id", id));
        return mapToResponse(g);
    }

    public BabyGrowthDTO.Response update(Long id, BabyGrowthDTO.Request request) {
        BabyGrowth g = babyGrowthRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BabyGrowth", "id", id));

        if (request.getWeightGrams() != null) g.setWeightGrams(request.getWeightGrams());
        if (request.getLengthCm() != null) g.setLengthCm(request.getLengthCm());
        if (request.getHeadCircumferenceCm() != null) g.setHeadCircumferenceCm(request.getHeadCircumferenceCm());
        if (request.getHeartRate() != null) g.setHeartRate(request.getHeartRate());
        if (request.getDevelopmentNotes() != null) g.setDevelopmentNotes(request.getDevelopmentNotes());
        if (request.getUltrasoundImageUrl() != null) g.setUltrasoundImageUrl(request.getUltrasoundImageUrl());
        if (request.getAiComparison() != null) g.setAiComparison(request.getAiComparison());
        if (request.getGrowthPercentile() != null) g.setGrowthPercentile(request.getGrowthPercentile());

        return mapToResponse(babyGrowthRepository.save(g));
    }

    public void delete(Long id) {
        if (!babyGrowthRepository.existsById(id)) {
            throw new ResourceNotFoundException("BabyGrowth", "id", id);
        }
        babyGrowthRepository.deleteById(id);
    }

    private BabyGrowthDTO.Response mapToResponse(BabyGrowth g) {
        return BabyGrowthDTO.Response.builder()
            .id(g.getId())
            .pregnancyId(g.getPregnancy().getId())
            .weekNumber(g.getWeekNumber())
            .weightGrams(g.getWeightGrams())
            .lengthCm(g.getLengthCm())
            .headCircumferenceCm(g.getHeadCircumferenceCm())
            .abdominalCircumferenceCm(g.getAbdominalCircumferenceCm())
            .femurLengthCm(g.getFemurLengthCm())
            .heartRate(g.getHeartRate())
            .developmentNotes(g.getDevelopmentNotes())
            .recordedDate(g.getRecordedDate())
            .aiComparison(g.getAiComparison())
            .growthPercentile(g.getGrowthPercentile())
            .ultrasoundImageUrl(g.getUltrasoundImageUrl())
            .createdAt(g.getCreatedAt())
            .build();
    }
}
