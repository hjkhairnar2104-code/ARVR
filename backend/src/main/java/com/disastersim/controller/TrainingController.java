package com.disastersim.controller;

import com.disastersim.dto.*;
import com.disastersim.entity.EmployeeAction;
import com.disastersim.entity.User;
import com.disastersim.service.AuthService;
import com.disastersim.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final AuthService authService;

    @PostMapping("/api/training/start")
    public ResponseEntity<TrainingSessionResponse> startTraining(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartTrainingRequest request
    ) {
        User user = authService.getCurrentUserEntity(userDetails.getUsername());
        TrainingSessionResponse session = trainingService.startTraining(user.getId(), request);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping("/api/training/{id}/action")
    public ResponseEntity<EmployeeAction> recordAction(
            @PathVariable Long id,
            @Valid @RequestBody RecordActionRequest request
    ) {
        EmployeeAction action = trainingService.recordAction(id, request);
        return new ResponseEntity<>(action, HttpStatus.CREATED);
    }

    @PostMapping("/api/training/{id}/complete")
    public ResponseEntity<TrainingSessionResponse> completeTraining(
            @PathVariable Long id,
            @RequestBody CompleteTrainingRequest request
    ) {
        TrainingSessionResponse completed = trainingService.completeTraining(id, request);
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/api/training/{id}")
    public ResponseEntity<TrainingSessionResponse> getTrainingSession(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getSessionById(id));
    }

    @GetMapping("/api/training/{id}/report")
    public ResponseEntity<TrainingReportDto> getTrainingReport(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getSessionReport(id));
    }

    @GetMapping("/api/employees/{id}/training-history")
    public ResponseEntity<List<TrainingSessionResponse>> getEmployeeHistory(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getEmployeeTrainingHistory(id));
    }

    @GetMapping("/api/employees/{id}/performance")
    public ResponseEntity<Map<String, Object>> getEmployeePerformance(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getEmployeePerformance(id));
    }
}
