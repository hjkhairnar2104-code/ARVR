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
public class AnalyticsDto {
    private List<Map<String, Object>> performanceOverTime;
    private List<Map<String, Object>> scenarioDistribution;
    private List<Map<String, Object>> commonMistakes;
    private List<Map<String, Object>> riskLevels;
    private Map<String, Double> categoryAverages;
}
