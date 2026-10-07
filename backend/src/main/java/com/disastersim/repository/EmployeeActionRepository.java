package com.disastersim.repository;

import com.disastersim.entity.EmployeeAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeActionRepository extends JpaRepository<EmployeeAction, Long> {
    List<EmployeeAction> findByTrainingSessionIdOrderByTimestampAsc(Long trainingSessionId);
}
