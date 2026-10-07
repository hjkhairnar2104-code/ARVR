package com.disastersim.controller;

import com.disastersim.dto.AdminDashboardStatsDto;
import com.disastersim.dto.AnalyticsDto;
import com.disastersim.dto.TrainingSessionResponse;
import com.disastersim.dto.UserDto;
import com.disastersim.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStatsDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/employees")
    public ResponseEntity<List<UserDto>> getEmployees() {
        return ResponseEntity.ok(adminService.getAllEmployees());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @GetMapping("/training-sessions")
    public ResponseEntity<List<TrainingSessionResponse>> getTrainingSessions() {
        return ResponseEntity.ok(adminService.getAllTrainingSessions());
    }
}
