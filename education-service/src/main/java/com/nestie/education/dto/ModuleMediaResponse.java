package com.nestie.education.dto;

import com.nestie.education.entity.ModuleMedia.MediaType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Education module media asset")
public class ModuleMediaResponse {
    private Long id;
    private MediaType type;
    private String url;
    private String caption;
    private Integer displayOrder;
}