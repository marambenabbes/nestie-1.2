package com.nestie.preview.service;

import com.nestie.preview.dto.BabyPreviewDTO;
import com.nestie.preview.entity.BabyPreview;
import com.nestie.preview.exception.BadRequestException;
import com.nestie.preview.exception.RateLimitExceededException;
import com.nestie.preview.exception.ResourceNotFoundException;
import com.nestie.preview.repository.BabyPreviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BabyPreviewService {

    private final BabyPreviewRepository babyPreviewRepository;
    private final GeminiImageService geminiImageService;

    @Value("${app.baby-preview.daily-limit:3}")
    private int dailyLimit;

    @Value("${app.baby-preview.expiry-days:30}")
    private int expiryDays;

    public BabyPreviewDTO.RateLimitInfo getRateLimitInfo(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long used = babyPreviewRepository.countByUserIdAndCreatedAtAfter(userId, since);

        BabyPreviewDTO.RateLimitInfo info = new BabyPreviewDTO.RateLimitInfo();
        info.setDailyLimit(dailyLimit);
        info.setUsedToday((int) used);
        info.setRemaining(Math.max(0, dailyLimit - (int) used));
        info.setCanGenerate(used < dailyLimit);
        return info;
    }

    private void checkRateLimit(Long userId) {
        BabyPreviewDTO.RateLimitInfo info = getRateLimitInfo(userId);
        if (!info.isCanGenerate()) {
            throw new RateLimitExceededException(
                    "Daily limit of " + dailyLimit + " baby previews reached. Try again tomorrow.");
        }
    }

    @Transactional
    public BabyPreviewDTO.Response generate(Long userId, BabyPreviewDTO.Request request) {
        checkRateLimit(userId);

        if (request.getMotherPhoto() == null || request.getFatherPhoto() == null) {
            throw new BadRequestException("Both parent photos are required");
        }

        BabyPreview preview = new BabyPreview();
        preview.setUserId(userId);
        preview.setGender(request.getGender());
        preview.setAge(request.getAge());
        preview.setStyle(request.getStyle() != null ? request.getStyle() : "REALISTIC");
        preview.setStatus("PROCESSING");
        preview.setExpiresAt(LocalDateTime.now().plusDays(expiryDays));
        preview = babyPreviewRepository.save(preview);

        generateAsync(preview.getId(), request.getMotherPhoto(),
                request.getFatherPhoto(), preview.getGender(),
                preview.getAge(), preview.getStyle());

        return mapToResponse(preview);
    }

    @Async
    @Transactional
    public void generateAsync(Long previewId, String motherPhoto, String fatherPhoto,
                               String gender, String age, String style) {
        BabyPreview preview = babyPreviewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview not found"));

        try {
            String prompt = geminiImageService.buildPrompt(gender, age, style);
            preview.setPromptUsed(prompt);

            String generatedImage = geminiImageService.generateBabyImage(motherPhoto, fatherPhoto, prompt);
            preview.setGeneratedImageBase64(generatedImage);
            preview.setStatus("COMPLETED");
            log.info("Baby preview {} generated successfully", previewId);
        } catch (Exception e) {
            preview.setStatus("FAILED");
            preview.setErrorMessage(e.getMessage());
            log.error("Baby preview {} generation failed: {}", previewId, e.getMessage());
        }

        babyPreviewRepository.save(preview);
    }

    @Transactional(readOnly = true)
    public BabyPreviewDTO.Response getById(Long id) {
        BabyPreview preview = babyPreviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Baby preview not found with id: " + id));
        return mapToResponse(preview);
    }

    @Transactional(readOnly = true)
    public List<BabyPreviewDTO.Response> getByUserId(Long userId) {
        return babyPreviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!babyPreviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Baby preview not found with id: " + id);
        }
        babyPreviewRepository.deleteById(id);
    }

    @Scheduled(fixedRate = 3600000) // every hour
    @Transactional
    public void cleanupExpiredPreviews() {
        List<BabyPreview> expired = babyPreviewRepository
                .findByExpiresAtBeforeAndGeneratedImageBase64IsNotNull(LocalDateTime.now());
        for (BabyPreview preview : expired) {
            preview.setGeneratedImageBase64(null);
            babyPreviewRepository.save(preview);
        }
        if (!expired.isEmpty()) {
            log.info("Cleaned up {} expired baby preview images", expired.size());
        }
    }

    private BabyPreviewDTO.Response mapToResponse(BabyPreview preview) {
        BabyPreviewDTO.Response response = new BabyPreviewDTO.Response();
        response.setId(preview.getId());
        response.setUserId(preview.getUserId());
        response.setGender(preview.getGender());
        response.setAge(preview.getAge());
        response.setStyle(preview.getStyle());
        response.setGeneratedImageBase64(preview.getGeneratedImageBase64());
        response.setPromptUsed(preview.getPromptUsed());
        response.setStatus(preview.getStatus());
        response.setErrorMessage(preview.getErrorMessage());
        response.setCreatedAt(preview.getCreatedAt());
        response.setExpiresAt(preview.getExpiresAt());
        return response;
    }
}
