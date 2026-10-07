package com.disastersim.repository;

import com.disastersim.entity.DisasterScenario;
import com.disastersim.entity.ScenarioType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisasterScenarioRepository extends JpaRepository<DisasterScenario, Long> {
    List<DisasterScenario> findByActiveTrue();
    Optional<DisasterScenario> findByType(ScenarioType type);
}
