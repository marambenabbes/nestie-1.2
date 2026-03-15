package com.nestie.preview.repository;

import com.nestie.preview.entity.BabyPreview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BabyPreviewRepository extends JpaRepository<BabyPreview, Long> {

    List<BabyPreview> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(bp) FROM BabyPreview bp WHERE bp.userId = :userId AND bp.createdAt >= :since AND bp.status IN ('COMPLETED', 'GENERATING', 'PENDING')")
    long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    List<BabyPreview> findByExpiresAtBeforeAndGeneratedImageBase64IsNotNull(LocalDateTime now);
}
