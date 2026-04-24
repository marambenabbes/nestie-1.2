package com.nestie.pregnancy.controller;

import com.nestie.pregnancy.dto.BabyGrowthDTO;
import com.nestie.pregnancy.dto.PageResponse;
import com.nestie.pregnancy.service.BabyGrowthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/baby-growth")
@RequiredArgsConstructor
@Tag(name = "Baby Growth Tracking", description = "Track baby development metrics")
public class BabyGrowthController {

    private final BabyGrowthService babyGrowthService;

    @PostMapping
    @Operation(summary = "Record baby growth data")
    public ResponseEntity<BabyGrowthDTO.Response> create(@Valid @RequestBody BabyGrowthDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(babyGrowthService.create(request));
    }

    @GetMapping("/pregnancy/{pregnancyId}")
    @Operation(summary = "Get all growth records for a pregnancy")
    public ResponseEntity<List<BabyGrowthDTO.Response>> getByPregnancyId(@PathVariable Long pregnancyId) {
        return ResponseEntity.ok(babyGrowthService.getByPregnancyId(pregnancyId));
    }

    @GetMapping("/pregnancy/{pregnancyId}/paged")
    @Operation(summary = "Get growth records paginated")
    public ResponseEntity<PageResponse<BabyGrowthDTO.Response>> getByPregnancyIdPaged(
            @PathVariable Long pregnancyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(babyGrowthService.getByPregnancyIdPaged(pregnancyId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get growth record by ID")
    public ResponseEntity<BabyGrowthDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(babyGrowthService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update growth record")
    public ResponseEntity<BabyGrowthDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody BabyGrowthDTO.Request request) {
        return ResponseEntity.ok(babyGrowthService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete growth record")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        babyGrowthService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
