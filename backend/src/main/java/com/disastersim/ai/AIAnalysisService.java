package com.disastersim.ai;

import com.disastersim.dto.TrainingReportDto;
import com.disastersim.entity.EmployeeAction;
import com.disastersim.entity.ScenarioType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AIAnalysisService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AIReportStructure {
        private String summary;
        private List<String> strengths = new ArrayList<>();
        private List<String> mistakes = new ArrayList<>();
        private List<String> recommendations = new ArrayList<>();
        private String riskLevel = "MEDIUM";
        private String trainingAdvice;
    }

    public TrainingReportDto generateReport(
            String scenarioName,
            ScenarioType scenarioType,
            Double score,
            Double safetyScore,
            Double decisionScore,
            Double responseScore,
            Double interactionScore,
            Double responseTime,
            List<EmployeeAction> actions
    ) {
        // Collect recorded event descriptions and names
        List<String> eventList = actions.stream()
                .map(a -> String.format("[%02d:%02d] %s (%s)",
                        (int)(a.getTimestamp() / 60),
                        (int)(a.getTimestamp() % 60),
                        a.getActionType(),
                        a.getDescription() != null ? a.getDescription() : (a.getCorrect() ? "Optimal action" : "Sub-optimal decision")))
                .collect(Collectors.toList());

        // Try AI analysis if API key is present
        if (StringUtils.hasText(geminiApiKey) && !geminiApiKey.equalsIgnoreCase("placeholder") && !geminiApiKey.contains("YOUR_")) {
            try {
                AIReportStructure aiReport = callGeminiAPI(scenarioName, scenarioType, score, responseTime, eventList);
                if (aiReport != null && StringUtils.hasText(aiReport.getSummary())) {
                    log.info("Successfully generated AI evaluation via Gemini for scenario: {}", scenarioName);
                    return buildReportDto(aiReport, score, safetyScore, decisionScore, responseScore, interactionScore, true);
                }
            } catch (Exception e) {
                log.warn("Gemini AI API call failed or timed out. Falling back to deterministic analysis engine: {}", e.getMessage());
            }
        }

        // Deterministic Fallback Engine based on actual recorded events
        log.info("Using deterministic safety analysis engine for report generation (Scenario: {}, Score: {})", scenarioName, score);
        AIReportStructure fallbackReport = generateDeterministicAnalysis(scenarioType, score, responseTime, actions);
        return buildReportDto(fallbackReport, score, safetyScore, decisionScore, responseScore, interactionScore, false);
    }

    private AIReportStructure callGeminiAPI(
            String scenarioName,
            ScenarioType scenarioType,
            Double score,
            Double responseTime,
            List<String> eventList
    ) throws Exception {
        String endpoint = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey.trim()
        );

        String systemPrompt = """
                You are DisasterSim AI, an elite corporate disaster-safety evaluator.
                Analyze the following employee disaster simulation training session.
                CRITICAL INSTRUCTION:
                1. Only evaluate the REAL recorded events provided below. DO NOT invent or assume actions that are not in the events list.
                2. Return ONLY a single, valid JSON object without markdown code blocks, backticks, or other text.
                JSON structure:
                {
                  "summary": "Concise executive summary of employee performance and protocol adherence",
                  "strengths": ["Clear strength 1 based on actual events", "Strength 2"],
                  "mistakes": ["Specific mistake 1 with safety consequence", "Mistake 2"],
                  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
                  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
                  "trainingAdvice": "Targeted advice for future emergency simulations"
                }
                """;

        String userPrompt = String.format(
                """
                Scenario: %s (%s)
                Score: %.1f / 100
                Total Response Time: %.1f seconds
                Recorded Chronological Events:
                %s
                """,
                scenarioName,
                scenarioType,
                score,
                responseTime,
                String.join("\n", eventList)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", systemPrompt + "\n\n" + userPrompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                String cleanJson = text.replaceAll("```json", "").replaceAll("```", "").trim();
                return objectMapper.readValue(cleanJson, AIReportStructure.class);
            }
        }

        return null;
    }

    public AIReportStructure generateDeterministicAnalysis(
            ScenarioType scenarioType,
            Double score,
            Double responseTime,
            List<EmployeeAction> actions
    ) {
        AIReportStructure report = new AIReportStructure();

        boolean reachedSafeZone = actions.stream().anyMatch(a ->
                "SAFE_ZONE_REACHED".equalsIgnoreCase(a.getActionType()) ||
                "SIMULATION_COMPLETED".equalsIgnoreCase(a.getActionType()) ||
                "ELEVATED_AREA_REACHED".equalsIgnoreCase(a.getActionType())
        );

        boolean alarmTriggered = actions.stream().anyMatch(a -> "ALARM_TRIGGERED".equalsIgnoreCase(a.getActionType()));
        boolean exitFound = actions.stream().anyMatch(a -> "EXIT_FOUND".equalsIgnoreCase(a.getActionType()));
        boolean extinguisherPicked = actions.stream().anyMatch(a -> "FIRE_EXTINGUISHER_PICKED".equalsIgnoreCase(a.getActionType()));
        boolean extinguisherUsed = actions.stream().anyMatch(a -> "FIRE_EXTINGUISHER_USED".equalsIgnoreCase(a.getActionType()));
        boolean dropCoverHold = actions.stream().anyMatch(a -> "DROP_COVER_HOLD".equalsIgnoreCase(a.getActionType()) || "COVER_TAKEN".equalsIgnoreCase(a.getActionType()));

        long dangerousAreaCount = actions.stream().filter(a -> "DANGEROUS_AREA_ENTERED".equalsIgnoreCase(a.getActionType())).count();
        long wrongRouteCount = actions.stream().filter(a -> "WRONG_ROUTE".equalsIgnoreCase(a.getActionType()) || "BLOCKED_ROUTE_TAKEN".equalsIgnoreCase(a.getActionType())).count();

        // 1. Risk Level
        if (score >= 85) {
            report.setRiskLevel("LOW");
        } else if (score >= 65) {
            report.setRiskLevel("MEDIUM");
        } else if (score >= 40) {
            report.setRiskLevel("HIGH");
        } else {
            report.setRiskLevel("CRITICAL");
        }

        // 2. Strengths based on actual actions
        if (reachedSafeZone) {
            report.getStrengths().add(String.format("Successfully completed evacuation and arrived at designated safe zone in %.1f seconds.", responseTime));
        }
        if (alarmTriggered) {
            report.getStrengths().add("Initiated emergency notification by triggering the building alarm promptly.");
        }
        if (exitFound) {
            report.getStrengths().add("Identified the primary emergency fire exit without unnecessary wandering.");
        }
        if (extinguisherUsed) {
            report.getStrengths().add("Utilized fire extinguisher effectively to clear an incipient threat.");
        }
        if (dropCoverHold) {
            report.getStrengths().add("Executed the critical 'Drop, Cover, and Hold' posture beneath sturdy office furniture during seismic shocks.");
        }
        if (dangerousAreaCount == 0) {
            report.getStrengths().add("Maintained situational awareness and completely avoided hazardous thermal and smoke zones.");
        }
        if (report.getStrengths().isEmpty()) {
            report.getStrengths().add("Initiated simulation and maintained active navigation during the emergency phase.");
        }

        // 3. Mistakes based on actual actions
        if (!reachedSafeZone) {
            report.getMistakes().add("Failed to reach designated safe zone before the critical evacuation time limit.");
        }
        if (dangerousAreaCount > 0) {
            report.getMistakes().add(String.format("Entered hazardous danger perimeter %d time(s), exposing personnel to elevated thermal or smoke risks.", dangerousAreaCount));
        }
        if (wrongRouteCount > 0) {
            report.getMistakes().add(String.format("Navigated into dead ends or blocked passageways %d time(s), compromising evacuation efficiency.", wrongRouteCount));
        }
        if (!alarmTriggered && scenarioType == ScenarioType.FIRE) {
            report.getMistakes().add("Did not trigger the manual fire pull station upon hazard confirmation.");
        }
        if (!dropCoverHold && scenarioType == ScenarioType.EARTHQUAKE) {
            report.getMistakes().add("Failed to seek immediate overhead cover during peak structural vibration.");
        }
        if (report.getMistakes().isEmpty()) {
            report.getMistakes().add("Minor hesitation observed during pathing transitions.");
        }

        // 4. Recommendations
        if (scenarioType == ScenarioType.FIRE) {
            report.getRecommendations().add("Memorize nearest secondary emergency exit routes to avoid smoke accumulation areas.");
            report.getRecommendations().add("Always prioritize activating manual alarm stations before attempting any equipment intervention.");
            report.getRecommendations().add("Stay below smoke level when navigating through high-density atmospheric zones.");
        } else if (scenarioType == ScenarioType.FLOOD) {
            report.getRecommendations().add("Never attempt to traverse standing water in lower corridors or elevator banks.");
            report.getRecommendations().add("Proceed immediately to vertical egress routes (stairwells) to reach elevated refuge points.");
        } else {
            report.getRecommendations().add("Practice immediate Drop, Cover, and Hold instincts upon initial tremor onset.");
            report.getRecommendations().add("Do not evacuate until shaking has completely subsided and routes are verified clear of shattered glass.");
        }

        // 5. Summary
        if (score >= 80) {
            report.setSummary(String.format("Exemplary safety performance during %s scenario. The employee demonstrated decisive evacuation protocols and reached safety in %.1f seconds with minimal hazard exposure.", scenarioType, responseTime));
        } else if (score >= 60) {
            report.setSummary(String.format("Satisfactory response with areas for tactical refinement. Evacuation was completed, but navigation delays and proximity to hazard zones reduced overall score to %.1f.", score));
        } else {
            report.setSummary(String.format("Critical safety deficiencies identified during %s simulation. Significant hazard exposure or delayed evacuation resulted in high risk categorization (Score: %.1f). Retraining strongly advised.", scenarioType, score));
        }

        // 6. Training Advice
        if (score >= 85) {
            report.setTrainingAdvice("Ready for advanced multi-hazard VR drills and peer safety warden certification.");
        } else if (score >= 65) {
            report.setTrainingAdvice("Schedule a refresher drill within 30 days focusing on optimal egress pathway selection.");
        } else {
            report.setTrainingAdvice("Mandatory reassessment required. Review enterprise emergency action plans and repeat simulation.");
        }

        return report;
    }

    private TrainingReportDto buildReportDto(
            AIReportStructure aiReport,
            Double score,
            Double safetyScore,
            Double decisionScore,
            Double responseScore,
            Double interactionScore,
            boolean isAiGenerated
    ) {
        return TrainingReportDto.builder()
                .score(score)
                .safetyScore(safetyScore)
                .decisionScore(decisionScore)
                .responseScore(responseScore)
                .interactionScore(interactionScore)
                .summary(aiReport.getSummary())
                .strengths(aiReport.getStrengths())
                .mistakes(aiReport.getMistakes())
                .recommendations(aiReport.getRecommendations())
                .riskLevel(aiReport.getRiskLevel())
                .trainingAdvice(aiReport.getTrainingAdvice())
                .generatedAt(LocalDateTime.now())
                .isAiGenerated(isAiGenerated)
                .build();
    }
}
