package com.nestie.education.controller;

import com.nestie.education.dto.MediaUploadResponse;
import com.nestie.education.service.AccessService;
import com.nestie.education.service.EducationMediaStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/education/media")
@RequiredArgsConstructor
@Tag(name = "Education Media", description = "Upload and retrieve education media assets")
public class EducationMediaController {

    private final EducationMediaStorageService mediaStorageService;
    private final AccessService accessService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload education media",
        description = "Doctor/Admin endpoint for uploading lesson images or videos.",
        security = {@SecurityRequirement(name = "bearerAuth")},
        responses = {
            @ApiResponse(responseCode = "201", description = "Media uploaded"),
            @ApiResponse(responseCode = "403", description = "Doctor/Admin role required")
        }
    )
    public ResponseEntity<MediaUploadResponse> upload(
        @RequestHeader("X-User-Role") String role,
        @RequestPart("file") MultipartFile file
    ) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(mediaStorageService.store(file));
    }

    @GetMapping("/files/{filename:.+}")
    @Operation(
        summary = "Get education media file",
        description = "Public endpoint used by patient and doctor lesson views to stream uploaded media."
    )
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource file = mediaStorageService.loadAsResource(filename);
        MediaType mediaType = mediaStorageService.resolveMediaType(filename);
        return ResponseEntity.ok()
            .contentType(mediaType)
            .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
            .body(file);
    }
}
