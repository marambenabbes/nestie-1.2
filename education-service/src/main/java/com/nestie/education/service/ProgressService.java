package com.nestie.education.service;

import com.nestie.education.dto.UserProgressResponse;
import com.nestie.education.entity.EducationModule;
import com.nestie.education.entity.UserModuleProgress;
import com.nestie.education.repository.UserModuleProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final EducationModuleService moduleService;
    private final UserModuleProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<UserProgressResponse> getByPatient(Long patientId) {
        return progressRepository.findByPatientIdOrderByUpdatedAtDesc(patientId).stream()
            .map(this::map)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserProgressResponse getByPatientAndModule(Long patientId, Long moduleId) {
        return map(getOrCreate(patientId, moduleId));
    }

    @Transactional
    public UserProgressResponse markViewed(Long patientId, Long moduleId) {
        UserModuleProgress progress = getOrCreate(patientId, moduleId);
        progress.setLastViewedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        progress.setCompletionPercentage(Math.max(progress.getCompletionPercentage(), 35));
        if (progress.getCompletionPercentage() >= 100) {
            progress.setCompleted(true);
            progress.setCompletedAt(progress.getCompletedAt() == null ? LocalDateTime.now() : progress.getCompletedAt());
        }
        return map(progressRepository.save(progress));
    }

    @Transactional
    public UserProgressResponse markCompleted(Long patientId, Long moduleId) {
        UserModuleProgress progress = getOrCreate(patientId, moduleId);
        progress.setLastViewedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        progress.setCompletionPercentage(100);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        return map(progressRepository.save(progress));
    }

    @Transactional
    public UserModuleProgress updateFromQuiz(Long patientId, Long moduleId, int correctAnswers, int totalQuestions) {
        UserModuleProgress progress = getOrCreate(patientId, moduleId);
        double score = totalQuestions == 0 ? 0.0 : (correctAnswers * 100.0) / totalQuestions;
        int completion = totalQuestions == 0
            ? Math.max(progress.getCompletionPercentage(), 35)
            : Math.max(progress.getCompletionPercentage(), 35 + (int) Math.round(score * 0.65));

        progress.setCorrectAnswers(correctAnswers);
        progress.setTotalQuestions(totalQuestions);
        progress.setQuizScore(score);
        progress.setCompletionPercentage(Math.min(completion, 100));
        progress.setCompleted(progress.getCompletionPercentage() >= 100);
        progress.setLastViewedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        progress.setCompletedAt(progress.isCompleted() ? LocalDateTime.now() : progress.getCompletedAt());
        return progressRepository.save(progress);
    }

    public UserProgressResponse map(UserModuleProgress progress) {
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

    private UserModuleProgress getOrCreate(Long patientId, Long moduleId) {
        return progressRepository.findByPatientIdAndModuleId(patientId, moduleId)
            .orElseGet(() -> {
                EducationModule module = moduleService.getModuleEntity(moduleId);
                UserModuleProgress progress = UserModuleProgress.builder()
                    .patientId(patientId)
                    .module(module)
                    .completionPercentage(0)
                    .completed(false)
                    .updatedAt(LocalDateTime.now())
                    .build();
                return progressRepository.save(progress);
            });
    }
}