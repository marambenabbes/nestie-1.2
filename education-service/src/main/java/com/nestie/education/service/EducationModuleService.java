package com.nestie.education.service;

import com.nestie.education.dto.EducationModuleRequest;
import com.nestie.education.dto.EducationModuleResponse;
import com.nestie.education.dto.ModuleMediaResponse;
import com.nestie.education.dto.UserProgressResponse;
import com.nestie.education.entity.EducationModule;
import com.nestie.education.entity.ModuleMedia;
import com.nestie.education.entity.UserModuleProgress;
import com.nestie.education.exception.ResourceNotFoundException;
import com.nestie.education.repository.EducationModuleRepository;
import com.nestie.education.repository.UserModuleProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationModuleService {

    private final EducationModuleRepository moduleRepository;
    private final UserModuleProgressRepository progressRepository;

    @Transactional
    public EducationModuleResponse create(EducationModuleRequest request) {
        EducationModule module = new EducationModule();
        applyRequest(module, request);
        return mapToResponse(moduleRepository.save(module), null);
    }

    @Transactional
    public EducationModuleResponse update(Long moduleId, EducationModuleRequest request) {
        EducationModule module = getModuleEntity(moduleId);
        applyRequest(module, request);
        return mapToResponse(moduleRepository.save(module), null);
    }

    @Transactional(readOnly = true)
    public List<EducationModuleResponse> getAllModules() {
        return moduleRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(module -> mapToResponse(module, null))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EducationModuleResponse> getPublishedModulesForPatient(Long patientId) {
        List<EducationModule> modules = moduleRepository.findByPublishedTrueOrderByCreatedAtDesc();
        Map<Long, UserModuleProgress> progressMap = progressRepository
            .findByPatientIdAndModuleIdIn(patientId, modules.stream().map(EducationModule::getId).toList())
            .stream()
            .collect(Collectors.toMap(progress -> progress.getModule().getId(), Function.identity()));

        return modules.stream()
            .map(module -> mapToResponse(module, progressMap.get(module.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public EducationModuleResponse getModuleForAdmin(Long moduleId) {
        return mapToResponse(getModuleEntity(moduleId), null);
    }

    @Transactional(readOnly = true)
    public EducationModuleResponse getModuleForPatient(Long moduleId, Long patientId) {
        EducationModule module = getModuleEntity(moduleId);
        if (!module.isPublished()) {
            throw new ResourceNotFoundException("Education module not found");
        }
        UserModuleProgress progress = progressRepository.findByPatientIdAndModuleId(patientId, moduleId).orElse(null);
        return mapToResponse(module, progress);
    }

    @Transactional
    public void delete(Long moduleId) {
        moduleRepository.delete(getModuleEntity(moduleId));
    }

    @Transactional(readOnly = true)
    public EducationModule getModuleEntity(Long moduleId) {
        return moduleRepository.findById(moduleId)
            .orElseThrow(() -> new ResourceNotFoundException("Education module not found"));
    }

    public EducationModuleResponse mapToResponse(EducationModule module, UserModuleProgress progress) {
        return EducationModuleResponse.builder()
            .id(module.getId())
            .title(module.getTitle())
            .description(module.getDescription())
            .instructions(module.getInstructions())
            .thumbnailUrl(module.getThumbnailUrl())
            .estimatedMinutes(module.getEstimatedMinutes())
            .published(module.isPublished())
            .quizCount(module.getQuizQuestions().size())
            .mediaItems(module.getMediaItems().stream().map(this::mapMedia).toList())
            .progress(progress == null ? null : mapProgress(progress))
            .createdAt(module.getCreatedAt())
            .updatedAt(module.getUpdatedAt())
            .build();
    }

    private ModuleMediaResponse mapMedia(ModuleMedia media) {
        return ModuleMediaResponse.builder()
            .id(media.getId())
            .type(media.getType())
            .url(media.getUrl())
            .caption(media.getCaption())
            .displayOrder(media.getDisplayOrder())
            .build();
    }

    private UserProgressResponse mapProgress(UserModuleProgress progress) {
        return UserProgressResponse.builder()
            .moduleId(progress.getModule().getId())
            .moduleTitle(progress.getModule().getTitle())
            .thumbnailUrl(progress.getModule().getThumbnailUrl())
            .patientId(progress.getPatientId())
            .completionPercentage(progress.getCompletionPercentage())
            .completed(progress.isCompleted())
            .quizScore(progress.getQuizScore())
            .correctAnswers(progress.getCorrectAnswers())
            .totalQuestions(progress.getTotalQuestions())
            .lastViewedAt(progress.getLastViewedAt())
            .completedAt(progress.getCompletedAt())
            .build();
    }

    private void applyRequest(EducationModule module, EducationModuleRequest request) {
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setInstructions(request.getInstructions());
        module.setThumbnailUrl(request.getThumbnailUrl());
        module.setEstimatedMinutes(request.getEstimatedMinutes());
        module.setPublished(Boolean.TRUE.equals(request.getPublished()));
        module.replaceMedia(request.getMediaItems().stream()
            .map(item -> ModuleMedia.builder()
                .type(item.getType())
                .url(item.getUrl())
                .caption(item.getCaption())
                .displayOrder(item.getDisplayOrder())
                .build())
            .toList());
    }
}