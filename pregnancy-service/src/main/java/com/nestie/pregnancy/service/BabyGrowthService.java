package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.BabyGrowthDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.entity.BabyGrowth;
import com.nestie.pregnancy.entity.PregnancyProfile;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.BabyGrowthRepository;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BabyGrowthService {

    private final BabyGrowthRepository babyGrowthRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final UltrasoundAIService ultrasoundAIService;

    public BabyGrowthDTO.Response create(BabyGrowthDTO.Request request) {
        PregnancyProfile pregnancy = pregnancyProfileRepository.findById(request.getPregnancyId())
            .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", request.getPregnancyId()));

        // Auto-generate AI analysis if measurements or image provided
        String aiAnalysis = generateAIAnalysis(request);

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
            .aiComparison(aiAnalysis != null ? aiAnalysis : request.getAiComparison())
            .growthPercentile(request.getGrowthPercentile())
            .ultrasoundImageUrl(request.getUltrasoundImageUrl())
            .build();

        log.info("Creating baby growth record for pregnancy {} at week {}", request.getPregnancyId(), request.getWeekNumber());
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

        boolean measurementsChanged = false;

        if (request.getWeightGrams() != null && !request.getWeightGrams().equals(g.getWeightGrams())) {
            g.setWeightGrams(request.getWeightGrams());
            measurementsChanged = true;
        }
        if (request.getLengthCm() != null && !request.getLengthCm().equals(g.getLengthCm())) {
            g.setLengthCm(request.getLengthCm());
            measurementsChanged = true;
        }
        if (request.getHeadCircumferenceCm() != null && !request.getHeadCircumferenceCm().equals(g.getHeadCircumferenceCm())) {
            g.setHeadCircumferenceCm(request.getHeadCircumferenceCm());
            measurementsChanged = true;
        }
        if (request.getAbdominalCircumferenceCm() != null && !request.getAbdominalCircumferenceCm().equals(g.getAbdominalCircumferenceCm())) {
            g.setAbdominalCircumferenceCm(request.getAbdominalCircumferenceCm());
            measurementsChanged = true;
        }
        if (request.getFemurLengthCm() != null && !request.getFemurLengthCm().equals(g.getFemurLengthCm())) {
            g.setFemurLengthCm(request.getFemurLengthCm());
            measurementsChanged = true;
        }
        if (request.getHeartRate() != null && !request.getHeartRate().equals(g.getHeartRate())) {
            g.setHeartRate(request.getHeartRate());
            measurementsChanged = true;
        }
        if (request.getDevelopmentNotes() != null) g.setDevelopmentNotes(request.getDevelopmentNotes());
        if (request.getUltrasoundImageUrl() != null) {
            g.setUltrasoundImageUrl(request.getUltrasoundImageUrl());
            measurementsChanged = true;
        }
        if (request.getGrowthPercentile() != null) g.setGrowthPercentile(request.getGrowthPercentile());

        // Regenerate AI analysis if measurements changed
        if (measurementsChanged) {
            log.info("Measurements changed, regenerating AI analysis for growth record {}", id);
            try {
                String aiAnalysis = ultrasoundAIService.analyzeUltrasound(
                        g.getWeekNumber(),
                        g.getUltrasoundImageUrl(),
                        g.getWeightGrams(),
                        g.getLengthCm(),
                        g.getHeadCircumferenceCm(),
                        g.getFemurLengthCm(),
                        g.getAbdominalCircumferenceCm(),
                        g.getHeartRate()
                );
                if (aiAnalysis != null && !aiAnalysis.contains("AI analysis failed") && !aiAnalysis.contains("unavailable")) {
                    g.setAiComparison(aiAnalysis);
                }
            } catch (Exception e) {
                log.error("Failed to regenerate AI analysis, continuing without it", e);
                // Don't fail the update if AI analysis fails
            }
        } else if (request.getAiComparison() != null) {
            g.setAiComparison(request.getAiComparison());
        }

        return mapToResponse(babyGrowthRepository.save(g));
    }

    public void delete(Long id) {
        if (!babyGrowthRepository.existsById(id)) {
            throw new ResourceNotFoundException("BabyGrowth", "id", id);
        }
        babyGrowthRepository.deleteById(id);
    }

    /**
     * Generate AI analysis for baby growth measurements
     */
    private String generateAIAnalysis(BabyGrowthDTO.Request request) {
        // Only generate if we have at least one measurement or an image
        boolean hasMeasurements = request.getWeightGrams() != null ||
                request.getLengthCm() != null ||
                request.getHeadCircumferenceCm() != null ||
                request.getFemurLengthCm() != null ||
                request.getAbdominalCircumferenceCm() != null ||
                request.getHeartRate() != null;

        boolean hasImage = request.getUltrasoundImageUrl() != null && !request.getUltrasoundImageUrl().isBlank();

        if (!hasMeasurements && !hasImage) {
            log.debug("No measurements or image provided, skipping AI analysis");
            return null;
        }

        try {
            log.info("Generating AI analysis for week {} with measurements and/or image", request.getWeekNumber());
            String analysis = ultrasoundAIService.analyzeUltrasound(
                    request.getWeekNumber(),
                    request.getUltrasoundImageUrl(),
                    request.getWeightGrams(),
                    request.getLengthCm(),
                    request.getHeadCircumferenceCm(),
                    request.getFemurLengthCm(),
                    request.getAbdominalCircumferenceCm(),
                    request.getHeartRate()
            );
            
            // If AI service is unavailable, return null instead of error message
            if (analysis != null && (analysis.contains("AI analysis failed") || analysis.contains("unavailable"))) {
                log.warn("AI analysis returned error, skipping: {}", analysis);
                return null;
            }
            
            return analysis;
        } catch (Exception e) {
            log.error("Failed to generate AI analysis, continuing without it", e);
            // Don't fail the entire save operation if AI analysis fails
            return null;
        }
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
