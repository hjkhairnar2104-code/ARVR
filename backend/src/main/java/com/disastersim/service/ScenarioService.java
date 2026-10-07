package com.disastersim.service;

import com.disastersim.dto.ScenarioRequest;
import com.disastersim.entity.DisasterScenario;
import com.disastersim.exception.ResourceNotFoundException;
import com.disastersim.repository.DisasterScenarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final DisasterScenarioRepository scenarioRepository;

    public List<DisasterScenario> getActiveScenarios() {
        return scenarioRepository.findByActiveTrue();
    }

    public List<DisasterScenario> getAllScenarios() {
        return scenarioRepository.findAll();
    }

    public DisasterScenario getScenarioById(Long id) {
        return scenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with id: " + id));
    }

    @Transactional
    public DisasterScenario createScenario(ScenarioRequest request) {
        DisasterScenario scenario = DisasterScenario.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM")
                .duration(request.getDuration() != null ? request.getDuration() : 180)
                .active(request.getActive() != null ? request.getActive() : true)
                .iconUrl(request.getIconUrl())
                .build();
        return scenarioRepository.save(scenario);
    }

    @Transactional
    public DisasterScenario updateScenario(Long id, ScenarioRequest request) {
        DisasterScenario scenario = getScenarioById(id);
        scenario.setName(request.getName());
        scenario.setType(request.getType());
        scenario.setDescription(request.getDescription());
        if (request.getDifficulty() != null) scenario.setDifficulty(request.getDifficulty());
        if (request.getDuration() != null) scenario.setDuration(request.getDuration());
        if (request.getActive() != null) scenario.setActive(request.getActive());
        if (request.getIconUrl() != null) scenario.setIconUrl(request.getIconUrl());
        return scenarioRepository.save(scenario);
    }

    @Transactional
    public void deleteScenario(Long id) {
        DisasterScenario scenario = getScenarioById(id);
        scenarioRepository.delete(scenario);
    }
}
