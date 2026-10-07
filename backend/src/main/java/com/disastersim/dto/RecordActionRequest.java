package com.disastersim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordActionRequest {
    @NotBlank(message = "Action type is required")
    private String actionType;

    @NotNull(message = "Timestamp is required")
    private Double timestamp;

    private Double x;
    private Double y;
    private Double z;

    @Builder.Default
    private Boolean correct = true;

    private String description;
}
