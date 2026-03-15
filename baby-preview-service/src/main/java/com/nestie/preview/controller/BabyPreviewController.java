package com.nestie.preview.controller;

import com.nestie.preview.dto.BabyPreviewDTO;
import com.nestie.preview.service.BabyPreviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/baby-preview")
@RequiredArgsConstructor
public class BabyPreviewController {

    private final BabyPreviewService babyPreviewService;

    @PostMapping("/generate")
    public ResponseEntity<BabyPreviewDTO.Response> generate(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BabyPreviewDTO.Request request) {
        return ResponseEntity.ok(babyPreviewService.generate(userId, request));
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<BabyPreviewDTO.Response> getStatus(@PathVariable Long id) {
        return ResponseEntity.ok(babyPreviewService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BabyPreviewDTO.Response>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(babyPreviewService.getByUserId(userId));
    }

    @GetMapping("/rate-limit/{userId}")
    public ResponseEntity<BabyPreviewDTO.RateLimitInfo> getRateLimit(@PathVariable Long userId) {
        return ResponseEntity.ok(babyPreviewService.getRateLimitInfo(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        babyPreviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
