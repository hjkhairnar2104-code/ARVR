package com.disastersim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartTrainingRequest {
    @NotNull(message = "Scenario ID is required")
    private Long scenarioId;
}
