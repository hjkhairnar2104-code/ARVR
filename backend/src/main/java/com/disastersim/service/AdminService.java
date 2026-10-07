package com.disastersim.service;

import com.disastersim.dto.AdminDashboardStatsDto;
import com.disastersim.dto.AnalyticsDto;
import com.disastersim.dto.TrainingSessionResponse;
import com.disastersim.dto.UserDto;
import com.disastersim.entity.Role;
import com.disastersim.entity.TrainingReport;
import com.disastersim.entity.TrainingSession;
import com.disastersim.entity.User;
import com.disastersim.repository.TrainingReportRepository;
import com.disastersim.repository.TrainingSessionRepository;
import com.disastersim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TrainingSessionRepository sessionRepository;
    private final TrainingReportRepository reportRepository;
    private final TrainingService trainingService;

    public AdminDashboardStatsDto getDashboardStats() {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        List<TrainingSession> allSessions = sessionRepository.findAllByOrderByStartTimeDesc();

        long totalTrainings = allSessions.size();
        long completedTrainings = allSessions.stream()
                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getCompletionStatus()))
                .count();

        Double avgScore = sessionRepository.getOverallAverageScore();
        Double avgResponseTime = sessionRepository.getOverallAverageResponseTime();

        double passRate = totalTrainings > 0
                ? Math.round(((double) completedTrainings / totalTrainings * 100.0) * 10.0) / 10.0
                : 0.0;

        List<TrainingSessionResponse> recentTrainings = allSessions.stream()
                .limit(10)
                .map(trainingService::mapToResponse)
                .collect(Collectors.toList());

        Map<String, Long> scenarioDistribution = allSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getScenario().getName(), Collectors.counting()));

        List<TrainingReport> reports = reportRepository.findAll();
        Map<String, Long> riskDistribution = reports.stream()
                .collect(Collectors.groupingBy(TrainingReport::getRiskLevel, Collectors.counting()));

        return AdminDashboardStatsDto.builder()
                .totalEmployees((long) employees.size())
                .totalTrainings(totalTrainings)
                .completedTrainings(completedTrainings)
                .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .averageResponseTime(avgResponseTime != null ? Math.round(avgResponseTime * 10.0) / 10.0 : 0.0)
                .passRate(passRate)
                .recentTrainings(recentTrainings)
                .scenarioDistribution(scenarioDistribution)
                .riskDistribution(riskDistribution)
                .build();
    }

    public List<UserDto> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE)
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TrainingSessionResponse> getAllTrainingSessions() {
        return sessionRepository.findAllByOrderByStartTimeDesc().stream()
                .map(trainingService::mapToResponse)
                .collect(Collectors.toList());
    }

    public AnalyticsDto getAnalytics() {
        List<TrainingSession> sessions = sessionRepository.findAllByOrderByStartTimeDesc();
        List<TrainingReport> reports = reportRepository.findAll();

        // 1. Performance over time (grouped by date)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        Map<String, List<TrainingSession>> groupedByDate = sessions.stream()
                .collect(Collectors.groupingBy(s -> s.getStartTime().format(formatter), LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> performanceOverTime = new ArrayList<>();
        groupedByDate.forEach((date, sessionList) -> {
            double avg = sessionList.stream().mapToDouble(TrainingSession::getScore).average().orElse(0.0);
            double avgTime = sessionList.stream().mapToDouble(TrainingSession::getResponseTime).average().orElse(0.0);
            Map<String, Object> point = new HashMap<>();
            point.put("date", date);
            point.put("score", Math.round(avg * 10.0) / 10.0);
            point.put("responseTime", Math.round(avgTime * 10.0) / 10.0);
            point.put("sessions", sessionList.size());
            performanceOverTime.add(point);
        });

        // 2. Scenario distribution
        Map<String, Long> scCounts = sessions.stream()
                .collect(Collectors.groupingBy(s -> s.getScenario().getName(), Collectors.counting()));
        List<Map<String, Object>> scenarioDistribution = new ArrayList<>();
        scCounts.forEach((name, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", name);
            map.put("value", count);
            scenarioDistribution.add(map);
        });

        // 3. Risk Levels
        Map<String, Long> riskCounts = reports.stream()
                .collect(Collectors.groupingBy(TrainingReport::getRiskLevel, Collectors.counting()));
        List<Map<String, Object>> riskLevels = new ArrayList<>();
        riskCounts.forEach((risk, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("level", risk);
            map.put("count", count);
            riskLevels.add(map);
        });

        // 4. Common mistakes frequency
        Map<String, Integer> mistakeFreq = new HashMap<>();
        reports.forEach(r -> {
            if (r.getMistakes() != null) {
                r.getMistakes().forEach(m -> mistakeFreq.put(m, mistakeFreq.getOrDefault(m, 0) + 1));
            }
        });
        List<Map<String, Object>> commonMistakes = mistakeFreq.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("mistake", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // 5. Category averages
        double avgSafety = sessions.stream().mapToDouble(TrainingSession::getSafetyScore).average().orElse(35.0);
        double avgDecision = sessions.stream().mapToDouble(TrainingSession::getDecisionScore).average().orElse(22.0);
        double avgResponse = sessions.stream().mapToDouble(TrainingSession::getResponseScore).average().orElse(17.0);
        double avgInteraction = sessions.stream().mapToDouble(TrainingSession::getInteractionScore).average().orElse(12.0);

        Map<String, Double> categoryAverages = new HashMap<>();
        categoryAverages.put("safety", Math.round(avgSafety * 10.0) / 10.0);
        categoryAverages.put("decision", Math.round(avgDecision * 10.0) / 10.0);
        categoryAverages.put("response", Math.round(avgResponse * 10.0) / 10.0);
        categoryAverages.put("interaction", Math.round(avgInteraction * 10.0) / 10.0);

        return AnalyticsDto.builder()
                .performanceOverTime(performanceOverTime)
                .scenarioDistribution(scenarioDistribution)
                .commonMistakes(commonMistakes)
                .riskLevels(riskLevels)
                .categoryAverages(categoryAverages)
                .build();
    }
}
