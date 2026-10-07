package com.disastersim.service;

import com.disastersim.entity.EmployeeAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ScoringEngineService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {
        private double finalScore;
        private double safetyScore;
        private double decisionScore;
        private double responseScore;
        private double interactionScore;
        private boolean completedSuccessfully;
    }

    public ScoreBreakdown calculateScore(Object scenarioType, Double responseTime, Integer maxDuration, List<EmployeeAction> actions) {
        String typeStr = scenarioType != null ? scenarioType.toString() : "FIRE";
        if (actions == null || actions.isEmpty()) {
            return ScoreBreakdown.builder()
                    .finalScore(0.0)
                    .safetyScore(0.0)
                    .decisionScore(0.0)
                    .responseScore(0.0)
                    .interactionScore(0.0)
                    .completedSuccessfully(false)
                    .build();
        }

        Set<String> actionTypes = actions.stream()
                .map(EmployeeAction::getActionType)
                .collect(Collectors.toSet());

        double safetyScore = 0.0;     // Max 40
        double decisionScore = 0.0;   // Max 25
        double responseScore = 0.0;   // Max 20
        double interactionScore = 0.0;// Max 15

        boolean success = false;

        if ("FIRE".equalsIgnoreCase(typeStr)) {
            if (actionTypes.contains("EXIT_FOUND")) safetyScore += 20.0;
            if (actionTypes.contains("SAFE_ZONE_REACHED")) {
                safetyScore += 20.0;
                success = true;
            }

            if (actionTypes.contains("ALARM_TRIGGERED")) decisionScore += 15.0;
            if (actionTypes.contains("FIRE_EXTINGUISHED") || actionTypes.contains("FIRE_EXTINGUISHER_USED")) decisionScore += 10.0;

            if (actionTypes.contains("FIRE_EXTINGUISHER_PICKED")) interactionScore += 10.0;
            if (actionTypes.contains("PASS_PIN_PULLED") || actionTypes.contains("PASS_VALVE_TESTED")) interactionScore += 5.0;

        } else if ("FLOOD".equalsIgnoreCase(typeStr)) {
            if (actionTypes.contains("ELEVATED_AREA_REACHED") || actionTypes.contains("SAFE_ZONE_REACHED")) {
                safetyScore += 30.0;
                success = true;
            }
            if (actionTypes.contains("EXIT_FOUND")) safetyScore += 10.0;

            if (actionTypes.contains("MAIN_BREAKER_SHUTDOWN")) decisionScore += 15.0;
            if (actionTypes.contains("FLOOD_BARRIER_DEPLOYED")) decisionScore += 10.0;

            if (actionTypes.contains("LIFE_VEST_ACQUIRED")) interactionScore += 15.0;

        } else if ("EARTHQUAKE".equalsIgnoreCase(typeStr)) {
            if (actionTypes.contains("DROP_COVER_HOLD")) safetyScore += 25.0;
            if (actionTypes.contains("SAFE_ZONE_REACHED")) {
                safetyScore += 15.0;
                success = true;
            }

            if (actionTypes.contains("EXIT_FOUND")) decisionScore += 25.0;
            interactionScore += 15.0;
        }

        long wrongRoutes = actions.stream().filter(a -> "WRONG_ROUTE".equals(a.getActionType())).count();
        safetyScore = Math.max(0, safetyScore - (wrongRoutes * 10.0));

        double effectiveTime = (responseTime != null && responseTime > 0) ? responseTime : 60.0;
        double targetTime = (maxDuration != null && maxDuration > 0) ? (maxDuration * 0.4) : 70.0;
        if (effectiveTime <= targetTime) {
            responseScore = 20.0;
        } else if (effectiveTime <= (maxDuration != null ? maxDuration : 180.0)) {
            double ratio = (effectiveTime - targetTime) / ((maxDuration != null ? maxDuration : 180.0) - targetTime);
            responseScore = Math.max(5.0, 20.0 - (ratio * 15.0));
        } else {
            responseScore = 2.0;
        }

        double finalScore = Math.min(100.0, Math.round((safetyScore + decisionScore + responseScore + interactionScore) * 10.0) / 10.0);

        return ScoreBreakdown.builder()
                .finalScore(finalScore)
                .safetyScore(safetyScore)
                .decisionScore(decisionScore)
                .responseScore(Math.round(responseScore * 10.0) / 10.0)
                .interactionScore(interactionScore)
                .completedSuccessfully(success)
                .build();
    }
}
