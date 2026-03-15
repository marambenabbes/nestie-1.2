package com.nestie.pregnancy.service;

import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.dto.PregnancyProfileDTO;
import com.nestie.pregnancy.entity.PregnancyProfile;
import com.nestie.pregnancy.entity.PregnancyProfile.PregnancyStatus;
import com.nestie.pregnancy.exception.ResourceNotFoundException;
import com.nestie.pregnancy.repository.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PregnancyProfileService {

    private final PregnancyProfileRepository profileRepository;

    public PregnancyProfileDTO.Response create(Long userId, PregnancyProfileDTO.Request request) {
        PregnancyProfile profile = PregnancyProfile.builder()
            .userId(userId)
            .lastMenstrualPeriod(request.getLastMenstrualPeriod())
            .expectedDueDate(request.getExpectedDueDate())
            .bloodType(request.getBloodType())
            .prePregnancyWeight(request.getPrePregnancyWeight())
            .currentWeight(request.getCurrentWeight())
            .height(request.getHeight())
            .medicalConditions(request.getMedicalConditions())
            .allergies(request.getAllergies())
            .status(PregnancyStatus.ACTIVE)
            .doctorId(request.getDoctorId())
            .build();

        calculateWeekAndTrimester(profile);
        return mapToResponse(profileRepository.save(profile));
    }

    public PageResponse<PregnancyProfileDTO.Response> getByUserId(Long userId, int page, int size) {
        Page<PregnancyProfile> profiles = profileRepository.findByUserId(userId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));

        profiles.getContent().forEach(this::calculateWeekAndTrimester);

        return PageResponse.<PregnancyProfileDTO.Response>builder()
            .content(profiles.getContent().stream().map(this::mapToResponse).toList())
            .page(profiles.getNumber())
            .size(profiles.getSize())
            .totalElements(profiles.getTotalElements())
            .totalPages(profiles.getTotalPages())
            .last(profiles.isLast())
            .build();
    }

    public PageResponse<PregnancyProfileDTO.Response> getByDoctorId(Long doctorId, int page, int size) {
        Page<PregnancyProfile> profiles = profileRepository.findByDoctorId(doctorId,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));

        profiles.getContent().forEach(this::calculateWeekAndTrimester);

        return PageResponse.<PregnancyProfileDTO.Response>builder()
            .content(profiles.getContent().stream().map(this::mapToResponse).toList())
            .page(profiles.getNumber())
            .size(profiles.getSize())
            .totalElements(profiles.getTotalElements())
            .totalPages(profiles.getTotalPages())
            .last(profiles.isLast())
            .build();
    }

    public PregnancyProfileDTO.Response getById(Long id) {
        PregnancyProfile profile = profileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", id));
        calculateWeekAndTrimester(profile);
        return mapToResponse(profile);
    }

    public PregnancyProfileDTO.Response update(Long id, PregnancyProfileDTO.Request request) {
        PregnancyProfile profile = profileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PregnancyProfile", "id", id));

        if (request.getLastMenstrualPeriod() != null) profile.setLastMenstrualPeriod(request.getLastMenstrualPeriod());
        if (request.getExpectedDueDate() != null) profile.setExpectedDueDate(request.getExpectedDueDate());
        if (request.getBloodType() != null) profile.setBloodType(request.getBloodType());
        if (request.getHeight() != null) profile.setHeight(request.getHeight());
        if (request.getPrePregnancyWeight() != null) profile.setPrePregnancyWeight(request.getPrePregnancyWeight());
        if (request.getCurrentWeight() != null) profile.setCurrentWeight(request.getCurrentWeight());
        if (request.getMedicalConditions() != null) profile.setMedicalConditions(request.getMedicalConditions());
        if (request.getAllergies() != null) profile.setAllergies(request.getAllergies());
        if (request.getDoctorId() != null) profile.setDoctorId(request.getDoctorId());

        calculateWeekAndTrimester(profile);
        return mapToResponse(profileRepository.save(profile));
    }

    public void delete(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("PregnancyProfile", "id", id);
        }
        profileRepository.deleteById(id);
    }

    private void calculateWeekAndTrimester(PregnancyProfile profile) {
        long days = ChronoUnit.DAYS.between(profile.getLastMenstrualPeriod(), LocalDate.now());
        int weeks = Math.max(0, Math.min((int) (days / 7), 42));
        profile.setCurrentWeek(weeks);
        if (weeks <= 12) profile.setCurrentTrimester(1);
        else if (weeks <= 27) profile.setCurrentTrimester(2);
        else profile.setCurrentTrimester(3);
    }

    private PregnancyProfileDTO.Response mapToResponse(PregnancyProfile p) {
        return PregnancyProfileDTO.Response.builder()
            .id(p.getId())
            .userId(p.getUserId())
            .lastMenstrualPeriod(p.getLastMenstrualPeriod())
            .expectedDueDate(p.getExpectedDueDate())
            .currentWeek(p.getCurrentWeek())
            .currentTrimester(p.getCurrentTrimester())
            .bloodType(p.getBloodType())
            .prePregnancyWeight(p.getPrePregnancyWeight())
            .currentWeight(p.getCurrentWeight())
            .height(p.getHeight())
            .medicalConditions(p.getMedicalConditions())
            .allergies(p.getAllergies())
            .status(p.getStatus())
            .doctorId(p.getDoctorId())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
