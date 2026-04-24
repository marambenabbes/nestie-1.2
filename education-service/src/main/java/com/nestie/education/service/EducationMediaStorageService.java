package com.nestie.education.service;

import com.nestie.education.dto.MediaUploadResponse;
import com.nestie.education.exception.BadRequestException;
import com.nestie.education.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class EducationMediaStorageService {

    private static final Map<String, String> CONTENT_TYPE_TO_EXTENSION = Map.ofEntries(
        Map.entry("image/jpeg", ".jpg"),
        Map.entry("image/png", ".png"),
        Map.entry("image/gif", ".gif"),
        Map.entry("image/webp", ".webp"),
        Map.entry("video/mp4", ".mp4"),
        Map.entry("video/webm", ".webm"),
        Map.entry("video/quicktime", ".mov")
    );

    private final Path uploadRoot;
    private final String publicBaseUrl;

    public EducationMediaStorageService(
        @Value("${app.media.upload-dir:uploads/education-media}") String uploadDir,
        @Value("${app.media.public-base-url:http://localhost:8085/education}") String publicBaseUrl
    ) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = trimTrailingSlash(publicBaseUrl);
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize media upload directory", ex);
        }
    }

    public MediaUploadResponse store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!isAllowedContentType(contentType)) {
            throw new BadRequestException("Only image and video files are allowed");
        }

        String extension = resolveExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID().toString().replace("-", "") + extension;
        Path target = resolveSafePath(filename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store uploaded file", ex);
        }

        return MediaUploadResponse.builder()
            .url(publicBaseUrl + "/media/files/" + filename)
            .filename(filename)
            .contentType(contentType)
            .size(file.getSize())
            .build();
    }

    public Resource loadAsResource(String filename) {
        Path path = resolveSafePath(filename);
        if (!Files.exists(path) || !Files.isReadable(path)) {
            throw new ResourceNotFoundException("Media file not found");
        }
        try {
            return new UrlResource(path.toUri());
        } catch (IOException ex) {
            throw new ResourceNotFoundException("Media file not found");
        }
    }

    public MediaType resolveMediaType(String filename) {
        Path path = resolveSafePath(filename);
        try {
            String detected = Files.probeContentType(path);
            if (detected != null && !detected.isBlank()) {
                return MediaType.parseMediaType(detected);
            }
        } catch (Exception ignored) {
            // Fall back to a generic binary media type.
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private Path resolveSafePath(String filename) {
        if (filename == null || filename.isBlank() || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new BadRequestException("Invalid media filename");
        }
        Path resolved = uploadRoot.resolve(filename).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            throw new BadRequestException("Invalid media filename");
        }
        return resolved;
    }

    private String resolveExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int idx = originalFilename.lastIndexOf('.');
            if (idx >= 0 && idx < originalFilename.length() - 1) {
                String ext = originalFilename.substring(idx).toLowerCase();
                if (ext.length() <= 10) {
                    return ext;
                }
            }
        }
        return CONTENT_TYPE_TO_EXTENSION.getOrDefault(contentType, ".bin");
    }

    private boolean isAllowedContentType(String contentType) {
        return contentType.startsWith("image/") || contentType.startsWith("video/");
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType.toLowerCase();
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8085/education";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
