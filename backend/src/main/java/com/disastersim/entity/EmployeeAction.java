package com.disastersim.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_session_id", nullable = false)
    @JsonIgnore
    private TrainingSession trainingSession;

    @Column(nullable = false)
    private String actionType;

    @Column(nullable = false)
    private Double timestamp; // seconds into simulation

    private Double x;
    private Double y;
    private Double z;

    @Column(nullable = false)
    @Builder.Default
    private Boolean correct = true;

    @Column(columnDefinition = "TEXT")
    private String description;
}
