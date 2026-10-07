package com.disastersim.dto;

import com.disastersim.entity.DisasterScenario;
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
public class TrainingSessionResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private DisasterScenario scenario;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double score;
    private Double safetyScore;
    private Double decisionScore;
    private Double responseScore;
    private Double interactionScore;
    private Double responseTime;
    private String completionStatus;
    private List<RecordActionRequest> actions;
    private TrainingReportDto report;
}
