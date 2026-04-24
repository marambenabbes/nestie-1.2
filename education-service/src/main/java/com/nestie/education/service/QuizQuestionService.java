package com.nestie.education.service;

import com.nestie.education.dto.QuizQuestionRequest;
import com.nestie.education.dto.QuizQuestionResponse;
import com.nestie.education.dto.QuizSubmissionRequest;
import com.nestie.education.dto.QuizSubmissionResponse;
import com.nestie.education.entity.EducationModule;
import com.nestie.education.entity.QuizQuestion;
import com.nestie.education.entity.UserModuleProgress;
import com.nestie.education.exception.BadRequestException;
import com.nestie.education.exception.ResourceNotFoundException;
import com.nestie.education.repository.QuizQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizQuestionService {

    private final QuizQuestionRepository quizQuestionRepository;
    private final EducationModuleService moduleService;
    private final ProgressService progressService;

    @Transactional
    public QuizQuestionResponse create(Long moduleId, QuizQuestionRequest request) {
        EducationModule module = moduleService.getModuleEntity(moduleId);
        validateRequest(request);
        QuizQuestion question = new QuizQuestion();
        question.setModule(module);
        applyRequest(question, request);
        return map(quizQuestionRepository.save(question));
    }

    @Transactional(readOnly = true)
    public List<QuizQuestionResponse> getByModule(Long moduleId) {
        moduleService.getModuleEntity(moduleId);
        return quizQuestionRepository.findByModuleIdOrderByDisplayOrderAscIdAsc(moduleId).stream()
            .map(this::map)
            .toList();
    }

    @Transactional
    public QuizQuestionResponse update(Long moduleId, Long questionId, QuizQuestionRequest request) {
        validateRequest(request);
        QuizQuestion question = getQuestion(moduleId, questionId);
        applyRequest(question, request);
        return map(quizQuestionRepository.save(question));
    }

    @Transactional
    public void delete(Long moduleId, Long questionId) {
        quizQuestionRepository.delete(getQuestion(moduleId, questionId));
    }

    @Transactional
    public QuizSubmissionResponse submit(Long moduleId, Long patientId, QuizSubmissionRequest request) {
        List<QuizQuestion> questions = quizQuestionRepository.findByModuleIdOrderByDisplayOrderAscIdAsc(moduleId);
        if (questions.isEmpty()) {
            throw new BadRequestException("This module does not have any quiz questions yet");
        }

        int correctAnswers = 0;
        List<Long> correctQuestionIds = new ArrayList<>();
        for (QuizQuestion question : questions) {
            String submittedAnswer = request.getAnswers().get(question.getId());
            boolean correct = submittedAnswer != null && question.getCorrectAnswer().equalsIgnoreCase(submittedAnswer.trim());
            if (correct) {
                correctAnswers++;
                correctQuestionIds.add(question.getId());
            }
        }

        int totalQuestions = questions.size();
        UserModuleProgress progress = progressService.updateFromQuiz(patientId, moduleId, correctAnswers, totalQuestions);

        return QuizSubmissionResponse.builder()
            .moduleId(moduleId)
            .patientId(patientId)
            .correctAnswers(correctAnswers)
            .totalQuestions(totalQuestions)
            .scorePercentage(progress.getQuizScore())
            .correctQuestionIds(correctQuestionIds)
            .progress(progressService.map(progress))
            .build();
    }

    private void validateRequest(QuizQuestionRequest request) {
        if (request.getQuestionType() == QuizQuestion.QuestionType.TRUE_FALSE && request.getAnswerOptions().size() != 2) {
            throw new BadRequestException("True/false questions must contain exactly two options");
        }
        boolean answerExists = request.getAnswerOptions().stream()
            .anyMatch(option -> option.equalsIgnoreCase(request.getCorrectAnswer()));
        if (!answerExists) {
            throw new BadRequestException("Correct answer must match one of the provided answer options");
        }
    }

    private QuizQuestion getQuestion(Long moduleId, Long questionId) {
        return quizQuestionRepository.findByIdAndModuleId(questionId, moduleId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz question not found"));
    }

    private QuizQuestionResponse map(QuizQuestion question) {
        return QuizQuestionResponse.builder()
            .id(question.getId())
            .moduleId(question.getModule().getId())
            .questionType(question.getQuestionType())
            .questionText(question.getQuestionText())
            .answerOptions(question.getAnswerOptions())
            .correctAnswer(question.getCorrectAnswer())
            .explanation(question.getExplanation())
            .displayOrder(question.getDisplayOrder())
            .build();
    }

    private void applyRequest(QuizQuestion question, QuizQuestionRequest request) {
        question.setQuestionType(request.getQuestionType());
        question.setQuestionText(request.getQuestionText());
        question.setAnswerOptions(List.copyOf(request.getAnswerOptions()));
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setExplanation(request.getExplanation());
        question.setDisplayOrder(request.getDisplayOrder());
    }
}