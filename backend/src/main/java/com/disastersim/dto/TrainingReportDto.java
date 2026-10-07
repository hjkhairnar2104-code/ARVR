package com.disastersim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingReportDto {
    private Long id;
    private Long trainingSessionId;
    private Double score;
    private Double safetyScore;
    private Double decisionScore;
    private Double responseScore;
    private Double interactionScore;
    private String summary;
    private List<String> strengths;
    private List<String> mistakes;
    private List<String> recommendations;
    private String riskLevel;
    private String trainingAdvice;
    private LocalDateTime generatedAt;
    private Boolean isAiGenerated;
}
