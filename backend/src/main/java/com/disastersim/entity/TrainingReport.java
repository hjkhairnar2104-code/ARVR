package com.disastersim.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "training_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_session_id", nullable = false, unique = true)
    @JsonIgnore
    private TrainingSession trainingSession;

    @Column(nullable = false)
    private Double score;

    private Double safetyScore;
    private Double decisionScore;
    private Double responseScore;
    private Double interactionScore;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private List<String> mistakes = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private List<String> recommendations = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private String riskLevel = "LOW"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(columnDefinition = "TEXT")
    private String trainingAdvice;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
    }
}
