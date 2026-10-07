package com.disastersim.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "training_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"password"})
    private User employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scenario_id", nullable = false)
    private DisasterScenario scenario;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Builder.Default
    private Double score = 0.0;

    @Builder.Default
    private Double safetyScore = 0.0;

    @Builder.Default
    private Double decisionScore = 0.0;

    @Builder.Default
    private Double responseScore = 0.0;

    @Builder.Default
    private Double interactionScore = 0.0;

    @Builder.Default
    private Double responseTime = 0.0; // total duration / time to reach safety in seconds

    @Column(nullable = false)
    @Builder.Default
    private String completionStatus = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, FAILED

    @OneToMany(mappedBy = "trainingSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<EmployeeAction> actions = new ArrayList<>();

    @OneToOne(mappedBy = "trainingSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TrainingReport report;

    @PrePersist
    protected void onCreate() {
        if (this.startTime == null) {
            this.startTime = LocalDateTime.now();
        }
    }
}
