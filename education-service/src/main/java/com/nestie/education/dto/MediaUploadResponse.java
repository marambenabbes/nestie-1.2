package com.nestie.education.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload for uploaded education media")
public class MediaUploadResponse {

    @Schema(example = "http://localhost:9090/api/education/media/files/2f90fbf7c5a44fbc8dcf6a11c9f3aa18.mp4")
    private String url;

    @Schema(example = "2f90fbf7c5a44fbc8dcf6a11c9f3aa18.mp4")
    private String filename;

    @Schema(example = "video/mp4")
    private String contentType;

    @Schema(example = "1048576")
    private long size;
}
