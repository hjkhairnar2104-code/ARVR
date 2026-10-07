package com.disastersim.controller;

import com.disastersim.dto.ScenarioRequest;
import com.disastersim.entity.DisasterScenario;
import com.disastersim.service.ScenarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ScenarioController {

    private final ScenarioService scenarioService;

    @GetMapping("/api/scenarios")
    public ResponseEntity<List<DisasterScenario>> getActiveScenarios() {
        return ResponseEntity.ok(scenarioService.getActiveScenarios());
    }

    @GetMapping("/api/scenarios/{id}")
    public ResponseEntity<DisasterScenario> getScenarioById(@PathVariable Long id) {
        return ResponseEntity.ok(scenarioService.getScenarioById(id));
    }

    @PostMapping("/api/admin/scenarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisasterScenario> createScenario(@Valid @RequestBody ScenarioRequest request) {
        DisasterScenario created = scenarioService.createScenario(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/scenarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisasterScenario> updateScenario(
            @PathVariable Long id,
            @Valid @RequestBody ScenarioRequest request
    ) {
        return ResponseEntity.ok(scenarioService.updateScenario(id, request));
    }

    @DeleteMapping("/api/admin/scenarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteScenario(@PathVariable Long id) {
        scenarioService.deleteScenario(id);
        return ResponseEntity.noContent().build();
    }
}
