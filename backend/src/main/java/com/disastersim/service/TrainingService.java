package com.disastersim.service;

import com.disastersim.ai.AIAnalysisService;
import com.disastersim.dto.*;
import com.disastersim.entity.*;
import com.disastersim.exception.ResourceNotFoundException;
import com.disastersim.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingSessionRepository sessionRepository;
    private final EmployeeActionRepository actionRepository;
    private final TrainingReportRepository reportRepository;
    private final DisasterScenarioRepository scenarioRepository;
    private final UserRepository userRepository;
    private final ScoringEngineService scoringEngineService;
    private final AIAnalysisService aiAnalysisService;

    @Transactional
    public TrainingSessionResponse startTraining(Long employeeId, StartTrainingRequest request) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        DisasterScenario scenario = scenarioRepository.findById(request.getScenarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with id: " + request.getScenarioId()));

        TrainingSession session = TrainingSession.builder()
                .employee(employee)
                .scenario(scenario)
                .startTime(LocalDateTime.now())
                .completionStatus("IN_PROGRESS")
                .score(0.0)
                .safetyScore(0.0)
                .decisionScore(0.0)
                .responseScore(0.0)
                .interactionScore(0.0)
                .responseTime(0.0)
                .actions(new ArrayList<>())
                .build();

        session = sessionRepository.save(session);

        // Record initial event
        EmployeeAction startAction = EmployeeAction.builder()
                .trainingSession(session)
                .actionType("SIMULATION_STARTED")
                .timestamp(0.0)
                .x(0.0)
                .y(1.6)
                .z(0.0)
                .correct(true)
                .description("Simulation session initiated for " + scenario.getName())
                .build();
        actionRepository.save(startAction);

        return mapToResponse(session);
    }

    @Transactional
    public EmployeeAction recordAction(Long sessionId, RecordActionRequest request) {
        TrainingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found with id: " + sessionId));

        EmployeeAction action = EmployeeAction.builder()
                .trainingSession(session)
                .actionType(request.getActionType())
                .timestamp(request.getTimestamp())
                .x(request.getX())
                .y(request.getY())
                .z(request.getZ())
                .correct(request.getCorrect() != null ? request.getCorrect() : true)
                .description(request.getDescription())
                .build();

        return actionRepository.save(action);
    }

    @Transactional
    public TrainingSessionResponse completeTraining(Long sessionId, CompleteTrainingRequest request) {
        TrainingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found with id: " + sessionId));

        // If client batch-sent any unrecorded actions, save them
        if (request.getActions() != null && !request.getActions().isEmpty()) {
            for (RecordActionRequest actionReq : request.getActions()) {
                EmployeeAction action = EmployeeAction.builder()
                        .trainingSession(session)
                        .actionType(actionReq.getActionType())
                        .timestamp(actionReq.getTimestamp())
                        .x(actionReq.getX())
                        .y(actionReq.getY())
                        .z(actionReq.getZ())
                        .correct(actionReq.getCorrect() != null ? actionReq.getCorrect() : true)
                        .description(actionReq.getDescription())
                        .build();
                actionRepository.save(action);
            }
        }

        List<EmployeeAction> allActions = actionRepository.findByTrainingSessionIdOrderByTimestampAsc(sessionId);

        // Calculate score with Scoring Engine
        ScoringEngineService.ScoreBreakdown breakdown = scoringEngineService.calculateScore(
                session.getScenario().getType(),
                request.getResponseTime(),
                session.getScenario().getDuration(),
                allActions
        );

        session.setEndTime(LocalDateTime.now());
        session.setResponseTime(request.getResponseTime() != null ? request.getResponseTime() : 0.0);
        session.setScore(breakdown.getFinalScore());
        session.setSafetyScore(breakdown.getSafetyScore());
        session.setDecisionScore(breakdown.getDecisionScore());
        session.setResponseScore(breakdown.getResponseScore());
        session.setInteractionScore(breakdown.getInteractionScore());

        String status = request.getCompletionStatus() != null ? request.getCompletionStatus()
                : (breakdown.isCompletedSuccessfully() ? "COMPLETED" : "FAILED");
        session.setCompletionStatus(status);

        session = sessionRepository.save(session);

        // Generate AI Training Report
        TrainingReportDto reportDto = aiAnalysisService.generateReport(
                session.getScenario().getName(),
                session.getScenario().getType(),
                session.getScore(),
                session.getSafetyScore(),
                session.getDecisionScore(),
                session.getResponseScore(),
                session.getInteractionScore(),
                session.getResponseTime(),
                allActions
        );

        TrainingReport report = TrainingReport.builder()
                .trainingSession(session)
                .score(reportDto.getScore())
                .safetyScore(reportDto.getSafetyScore())
                .decisionScore(reportDto.getDecisionScore())
                .responseScore(reportDto.getResponseScore())
                .interactionScore(reportDto.getInteractionScore())
                .summary(reportDto.getSummary())
                .strengths(reportDto.getStrengths())
                .mistakes(reportDto.getMistakes())
                .recommendations(reportDto.getRecommendations())
                .riskLevel(reportDto.getRiskLevel())
                .trainingAdvice(reportDto.getTrainingAdvice())
                .build();

        report = reportRepository.save(report);
        session.setReport(report);

        return mapToResponse(session);
    }

    public TrainingSessionResponse getSessionById(Long sessionId) {
        TrainingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found with id: " + sessionId));
        return mapToResponse(session);
    }

    public TrainingReportDto getSessionReport(Long sessionId) {
        TrainingReport report = reportRepository.findByTrainingSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Training report not found for session: " + sessionId));
        return mapToReportDto(report);
    }

    public List<TrainingSessionResponse> getEmployeeTrainingHistory(Long employeeId) {
        return sessionRepository.findByEmployeeIdOrderByStartTimeDesc(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getEmployeePerformance(Long employeeId) {
        List<TrainingSession> sessions = sessionRepository.findByEmployeeIdOrderByStartTimeDesc(employeeId);
        long totalTrainings = sessions.size();
        long completedTrainings = sessions.stream().filter(s -> "COMPLETED".equalsIgnoreCase(s.getCompletionStatus())).count();

        Double avgScore = sessionRepository.getAverageScoreByEmployeeId(employeeId);
        Double bestScore = sessionRepository.getBestScoreByEmployeeId(employeeId);
        Double avgResponseTime = sessionRepository.getAverageResponseTimeByEmployeeId(employeeId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTrainings", totalTrainings);
        stats.put("completedTrainings", completedTrainings);
        stats.put("averageScore", avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0);
        stats.put("bestScore", bestScore != null ? Math.round(bestScore * 10.0) / 10.0 : 0.0);
        stats.put("averageResponseTime", avgResponseTime != null ? Math.round(avgResponseTime * 10.0) / 10.0 : 0.0);
        stats.put("passRate", totalTrainings > 0 ? Math.round(((double) completedTrainings / totalTrainings * 100.0) * 10.0) / 10.0 : 0.0);

        return stats;
    }

    public TrainingSessionResponse mapToResponse(TrainingSession session) {
        List<EmployeeAction> actions = actionRepository.findByTrainingSessionIdOrderByTimestampAsc(session.getId());
        List<RecordActionRequest> actionRequests = actions.stream()
                .map(a -> RecordActionRequest.builder()
                        .actionType(a.getActionType())
                        .timestamp(a.getTimestamp())
                        .x(a.getX())
                        .y(a.getY())
                        .z(a.getZ())
                        .correct(a.getCorrect())
                        .description(a.getDescription())
                        .build())
                .collect(Collectors.toList());

        TrainingReportDto reportDto = null;
        if (session.getReport() != null) {
            reportDto = mapToReportDto(session.getReport());
        }

        return TrainingSessionResponse.builder()
                .id(session.getId())
                .employeeId(session.getEmployee().getId())
                .employeeName(session.getEmployee().getName())
                .employeeEmail(session.getEmployee().getEmail())
                .scenario(session.getScenario())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .score(session.getScore())
                .safetyScore(session.getSafetyScore())
                .decisionScore(session.getDecisionScore())
                .responseScore(session.getResponseScore())
                .interactionScore(session.getInteractionScore())
                .responseTime(session.getResponseTime())
                .completionStatus(session.getCompletionStatus())
                .actions(actionRequests)
                .report(reportDto)
                .build();
    }

    public TrainingReportDto mapToReportDto(TrainingReport report) {
        return TrainingReportDto.builder()
                .id(report.getId())
                .trainingSessionId(report.getTrainingSession() != null ? report.getTrainingSession().getId() : null)
                .score(report.getScore())
                .safetyScore(report.getSafetyScore())
                .decisionScore(report.getDecisionScore())
                .responseScore(report.getResponseScore())
                .interactionScore(report.getInteractionScore())
                .summary(report.getSummary())
                .strengths(report.getStrengths())
                .mistakes(report.getMistakes())
                .recommendations(report.getRecommendations())
                .riskLevel(report.getRiskLevel())
                .trainingAdvice(report.getTrainingAdvice())
                .generatedAt(report.getGeneratedAt())
                .isAiGenerated(true)
                .build();
    }
}
