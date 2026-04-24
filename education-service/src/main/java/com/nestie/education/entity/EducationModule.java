package com.nestie.education.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "education_modules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 5000)
    private String instructions;

    @Column(length = 500)
    private String thumbnailUrl;

    private Integer estimatedMinutes;

    @Builder.Default
    private boolean published = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    @Builder.Default
    private List<ModuleMedia> mediaItems = new ArrayList<>();

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    @Builder.Default
    private List<QuizQuestion> quizQuestions = new ArrayList<>();

    public void replaceMedia(List<ModuleMedia> newMediaItems) {
        mediaItems.clear();
        if (newMediaItems == null) {
            return;
        }
        newMediaItems.forEach(this::addMedia);
    }

    public void addMedia(ModuleMedia media) {
        media.setModule(this);
        mediaItems.add(media);
    }
}