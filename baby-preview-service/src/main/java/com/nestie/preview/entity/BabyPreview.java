package com.nestie.preview.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "baby_previews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BabyPreview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String gender; // BOY, GIRL, NEUTRAL

    @Column(nullable = false, length = 20)
    private String age; // NEWBORN, SIX_MONTHS, ONE_YEAR, THREE_YEARS

    @Column(nullable = false, length = 20)
    private String style; // REALISTIC, CARTOON, THREE_D

    @Column(columnDefinition = "LONGTEXT")
    private String generatedImageBase64;

    @Column(columnDefinition = "TEXT")
    private String promptUsed;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, GENERATING, COMPLETED, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
