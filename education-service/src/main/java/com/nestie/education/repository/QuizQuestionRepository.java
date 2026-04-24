package com.nestie.education.repository;

import com.nestie.education.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByModuleIdOrderByDisplayOrderAscIdAsc(Long moduleId);
    Optional<QuizQuestion> findByIdAndModuleId(Long id, Long moduleId);
}