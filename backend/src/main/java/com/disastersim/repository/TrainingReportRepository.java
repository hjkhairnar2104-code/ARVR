package com.disastersim.repository;

import com.disastersim.entity.TrainingReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingReportRepository extends JpaRepository<TrainingReport, Long> {
    Optional<TrainingReport> findByTrainingSessionId(Long trainingSessionId);
}
