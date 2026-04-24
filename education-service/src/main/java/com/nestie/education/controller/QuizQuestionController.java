package com.nestie.education.controller;

import com.nestie.education.dto.QuizQuestionRequest;
import com.nestie.education.dto.QuizQuestionResponse;
import com.nestie.education.dto.QuizSubmissionRequest;
import com.nestie.education.dto.QuizSubmissionResponse;
import com.nestie.education.service.AccessService;
import com.nestie.education.service.QuizQuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/education/modules/{moduleId}/quizzes")
@RequiredArgsConstructor
@Tag(name = "Education Quizzes", description = "Quiz question management and patient quiz submission")
@SecurityRequirement(name = "bearerAuth")
public class QuizQuestionController {

    private final QuizQuestionService quizQuestionService;
    private final AccessService accessService;

    @PostMapping
    @Operation(
        summary = "Create quiz question",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                examples = @ExampleObject(
                    name = "Create quiz question example",
                    value = "{\n  \"questionType\": \"MULTIPLE_CHOICE\",\n  \"questionText\": \"Which nutrient helps reduce the risk of neural tube defects during pregnancy?\",\n  \"answerOptions\": [\"Vitamin D\", \"Folic acid\", \"Potassium\", \"Omega-3\"],\n  \"correctAnswer\": \"Folic acid\",\n  \"explanation\": \"Folic acid is especially important before conception and during early pregnancy.\",\n  \"displayOrder\": 1\n}"
                )
            )
        )
    )
    public ResponseEntity<QuizQuestionResponse> create(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @Valid @RequestBody QuizQuestionRequest request) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.status(HttpStatus.CREATED).body(quizQuestionService.create(moduleId, request));
    }

    @GetMapping
    @Operation(summary = "List quiz questions for a module")
    public ResponseEntity<List<QuizQuestionResponse>> getByModule(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role) {
        accessService.requireRoles(role, "PATIENT", "DOCTOR", "ADMIN");
        return ResponseEntity.ok(quizQuestionService.getByModule(moduleId));
    }

    @PutMapping("/{questionId}")
    @Operation(summary = "Update quiz question")
    public ResponseEntity<QuizQuestionResponse> update(
        @PathVariable Long moduleId,
        @PathVariable Long questionId,
        @RequestHeader("X-User-Role") String role,
        @Valid @RequestBody QuizQuestionRequest request) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        return ResponseEntity.ok(quizQuestionService.update(moduleId, questionId, request));
    }

    @DeleteMapping("/{questionId}")
    @Operation(summary = "Delete quiz question")
    public ResponseEntity<Void> delete(
        @PathVariable Long moduleId,
        @PathVariable Long questionId,
        @RequestHeader("X-User-Role") String role) {
        accessService.requireRoles(role, "DOCTOR", "ADMIN");
        quizQuestionService.delete(moduleId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/submit")
    @Operation(
        summary = "Submit quiz answers for current patient",
        responses = {
            @ApiResponse(responseCode = "200", description = "Quiz graded"),
            @ApiResponse(responseCode = "400", description = "Module has no quiz questions")
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                examples = @ExampleObject(
                    name = "Quiz submission example",
                    value = "{\n  \"answers\": {\n    \"11\": \"Folic acid\",\n    \"12\": \"true\"\n  }\n}"
                )
            )
        )
    )
    public ResponseEntity<QuizSubmissionResponse> submit(
        @PathVariable Long moduleId,
        @RequestHeader("X-User-Role") String role,
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody QuizSubmissionRequest request) {
        accessService.requireRoles(role, "PATIENT", "DOCTOR", "ADMIN");
        return ResponseEntity.ok(quizQuestionService.submit(moduleId, accessService.requireUserId(userId), request));
    }
}