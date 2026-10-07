package com.disastersim.repository;

import com.disastersim.entity.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {
    List<TrainingSession> findByEmployeeIdOrderByStartTimeDesc(Long employeeId);

    List<TrainingSession> findByEmployeeIdAndCompletionStatus(Long employeeId, String status);

    @Query("SELECT AVG(ts.score) FROM TrainingSession ts WHERE ts.employee.id = :employeeId AND ts.completionStatus = 'COMPLETED'")
    Double getAverageScoreByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT MAX(ts.score) FROM TrainingSession ts WHERE ts.employee.id = :employeeId AND ts.completionStatus = 'COMPLETED'")
    Double getBestScoreByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT AVG(ts.responseTime) FROM TrainingSession ts WHERE ts.employee.id = :employeeId AND ts.completionStatus = 'COMPLETED'")
    Double getAverageResponseTimeByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT AVG(ts.score) FROM TrainingSession ts WHERE ts.completionStatus = 'COMPLETED'")
    Double getOverallAverageScore();

    @Query("SELECT AVG(ts.responseTime) FROM TrainingSession ts WHERE ts.completionStatus = 'COMPLETED'")
    Double getOverallAverageResponseTime();

    List<TrainingSession> findAllByOrderByStartTimeDesc();
}
