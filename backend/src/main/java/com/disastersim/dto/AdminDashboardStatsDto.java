package com.disastersim.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private Long totalEmployees;
    private Long totalTrainings;
    private Long completedTrainings;
    private Double averageScore;
    private Double averageResponseTime;
    private Double passRate;
    private List<TrainingSessionResponse> recentTrainings;
    private Map<String, Long> scenarioDistribution;
    private Map<String, Long> riskDistribution;
}
