package com.disastersim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTrainingRequest {
    private Double responseTime; // Total time in seconds
    private String completionStatus; // COMPLETED or FAILED
    private List<RecordActionRequest> actions; // optional list of actions if client sends at completion
    private Double calculatedScore; // optional client-side computed score
    private Double safetyScore;
    private Double decisionScore;
    private Double responseScore;
    private Double interactionScore;
}
