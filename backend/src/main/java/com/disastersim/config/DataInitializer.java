package com.disastersim.config;

import com.disastersim.entity.*;
import com.disastersim.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DisasterScenarioRepository scenarioRepository;
    private final TrainingSessionRepository sessionRepository;
    private final EmployeeActionRepository actionRepository;
    private final TrainingReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking DisasterSim AI system seed data...");

        // 1. Seed Users
        User admin = userRepository.findByEmail("admin@disastersim.ai").orElseGet(() -> {
            User user = User.builder()
                    .name("Safety Administrator")
                    .email("admin@disastersim.ai")
                    .password(passwordEncoder.encode("Admin123!"))
                    .role(Role.ADMIN)
                    .build();
            return userRepository.save(user);
        });

        User employee1 = userRepository.findByEmail("sarah.chen@enterprise.com").orElseGet(() -> {
            User user = User.builder()
                    .name("Sarah Chen (Ops Lead)")
                    .email("sarah.chen@enterprise.com")
                    .password(passwordEncoder.encode("Employee123!"))
                    .role(Role.EMPLOYEE)
                    .build();
            return userRepository.save(user);
        });

        User employee2 = userRepository.findByEmail("david.kim@enterprise.com").orElseGet(() -> {
            User user = User.builder()
                    .name("David Kim (Safety Warden)")
                    .email("david.kim@enterprise.com")
                    .password(passwordEncoder.encode("Employee123!"))
                    .role(Role.EMPLOYEE)
                    .build();
            return userRepository.save(user);
        });

        // 2. Seed Scenarios
        DisasterScenario fireScenario = scenarioRepository.findByType(ScenarioType.FIRE).orElseGet(() -> {
            DisasterScenario s = DisasterScenario.builder()
                    .name("Office Fire Evacuation")
                    .type(ScenarioType.FIRE)
                    .description("High-fidelity 3D office fire simulation. Fire ignites in the breakroom, emitting dense smoke and heat. Activate the emergency pull station, pick up fire suppression equipment if necessary, navigate clear egress corridors, and evacuate to the designated exterior safe zone.")
                    .difficulty("MEDIUM")
                    .duration(180)
                    .active(true)
                    .iconUrl("flame")
                    .build();
            return scenarioRepository.save(s);
        });

        DisasterScenario floodScenario = scenarioRepository.findByType(ScenarioType.FLOOD).orElseGet(() -> {
            DisasterScenario s = DisasterScenario.builder()
                    .name("Office Flood Emergency")
                    .type(ScenarioType.FLOOD)
                    .description("Rapid water inundation emergency. Heavy rainfall and external breach flood ground corridors. Avoid submerged electrical hazards, locate safe stairwell access, and reach elevated second-floor refuge.")
                    .difficulty("HARD")
                    .duration(240)
                    .active(true)
                    .iconUrl("waves")
                    .build();
            return scenarioRepository.save(s);
        });

        DisasterScenario earthquakeScenario = scenarioRepository.findByType(ScenarioType.EARTHQUAKE).orElseGet(() -> {
            DisasterScenario s = DisasterScenario.builder()
                    .name("Office Earthquake Safety")
                    .type(ScenarioType.EARTHQUAKE)
                    .description("Seismic magnitude 6.8 tremor drill. Experience sudden violent tremors and falling ceiling tiles. Execute Drop, Cover, and Hold under reinforced desks until shocks terminate, then safely evacuate avoiding shattered glass.")
                    .difficulty("HARD")
                    .duration(210)
                    .active(true)
                    .iconUrl("activity")
                    .build();
            return scenarioRepository.save(s);
        });

        // 3. Seed Sample Training Session if empty
        if (sessionRepository.count() == 0) {
            log.info("Generating initial realistic training sessions and AI reports...");

            // Session 1: Sarah Chen - Fire Scenario (High score)
            TrainingSession s1 = TrainingSession.builder()
                    .employee(employee1)
                    .scenario(fireScenario)
                    .startTime(LocalDateTime.now().minusDays(2).minusHours(3))
                    .endTime(LocalDateTime.now().minusDays(2).minusHours(3).plusMinutes(2))
                    .score(92.5)
                    .safetyScore(38.0)
                    .decisionScore(24.5)
                    .responseScore(18.0)
                    .interactionScore(12.0)
                    .responseTime(78.4)
                    .completionStatus("COMPLETED")
                    .build();
            s1 = sessionRepository.save(s1);

            actionRepository.save(EmployeeAction.builder().trainingSession(s1).actionType("SIMULATION_STARTED").timestamp(0.0).correct(true).description("Simulation started in Office Room 101").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s1).actionType("FIRE_DETECTED").timestamp(6.2).correct(true).description("Observed active flame in kitchen breakroom").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s1).actionType("ALARM_TRIGGERED").timestamp(18.5).correct(true).description("Pulled manual fire alarm pull station on corridor wall").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s1).actionType("EXIT_FOUND").timestamp(45.0).correct(true).description("Identified illuminated emergency exit stairway").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s1).actionType("SAFE_ZONE_REACHED").timestamp(78.4).correct(true).description("Arrived at exterior parking muster point").build());

            TrainingReport r1 = TrainingReport.builder()
                    .trainingSession(s1)
                    .score(92.5)
                    .safetyScore(38.0)
                    .decisionScore(24.5)
                    .responseScore(18.0)
                    .interactionScore(12.0)
                    .summary("Exceptional protocol execution during Office Fire drill. Sound early alarm activation and steady egress path choice resulted in rapid safe-zone arrival.")
                    .strengths(List.of(
                            "Rapid identification of fire origin within 7 seconds of ignition",
                            "Immediate activation of manual pull station alerting all occupants",
                            "Zero entry into high-heat thermal zones"
                    ))
                    .mistakes(List.of(
                            "Did not verify extinguisher availability before committing to final egress run"
                    ))
                    .recommendations(List.of(
                            "Maintain current egress speed while glancing for nearby secondary suppression tools",
                            "Verify team muster headcount upon reaching exterior perimeter"
                    ))
                    .riskLevel("LOW")
                    .trainingAdvice("Recommended for Lead Emergency Floor Warden designation.")
                    .build();
            reportRepository.save(r1);

            // Session 2: David Kim - Fire Scenario (Moderate score with wrong turn)
            TrainingSession s2 = TrainingSession.builder()
                    .employee(employee2)
                    .scenario(fireScenario)
                    .startTime(LocalDateTime.now().minusDays(1).minusHours(5))
                    .endTime(LocalDateTime.now().minusDays(1).minusHours(5).plusMinutes(3))
                    .score(74.0)
                    .safetyScore(28.0)
                    .decisionScore(17.5)
                    .responseScore(14.5)
                    .interactionScore(14.0)
                    .responseTime(124.0)
                    .completionStatus("COMPLETED")
                    .build();
            s2 = sessionRepository.save(s2);

            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("SIMULATION_STARTED").timestamp(0.0).correct(true).description("Simulation started").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("FIRE_DETECTED").timestamp(8.0).correct(true).description("Fire flare detected").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("WRONG_ROUTE").timestamp(25.0).correct(false).description("Turned into dead-end copy room instead of corridor").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("DANGEROUS_AREA_ENTERED").timestamp(42.0).correct(false).description("Approached within 2m of expanding smoke plume").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("ALARM_TRIGGERED").timestamp(65.0).correct(true).description("Activated alarm station").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("FIRE_EXTINGUISHER_PICKED").timestamp(80.0).correct(true).description("Retrieved CO2 fire extinguisher").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("EXIT_FOUND").timestamp(105.0).correct(true).description("Found primary exit door").build());
            actionRepository.save(EmployeeAction.builder().trainingSession(s2).actionType("SAFE_ZONE_REACHED").timestamp(124.0).correct(true).description("Reached exterior safe zone").build());

            TrainingReport r2 = TrainingReport.builder()
                    .trainingSession(s2)
                    .score(74.0)
                    .safetyScore(28.0)
                    .decisionScore(17.5)
                    .responseScore(14.5)
                    .interactionScore(14.0)
                    .summary("Passable fire drill performance with tactical lapses. The employee took a wrong corridor route and penetrated the dangerous thermal smoke radius before initiating the alarm.")
                    .strengths(List.of(
                            "Proactively secured fire extinguisher to protect egress corridor",
                            "Successfully navigated to safe zone without catastrophic injury"
                    ))
                    .mistakes(List.of(
                            "Turned toward dead-end utility room during initial confusion",
                            "Entered dense smoke perimeter, reducing breathing visibility",
                            "Delayed alarm activation until 65 seconds into emergency"
                    ))
                    .recommendations(List.of(
                            "Prioritize alarm trigger immediately upon smoke sighting",
                            "Memorize building floor plan to avoid dead ends in low visibility",
                            "Do not approach active flame radius without proper PPE"
                    ))
                    .riskLevel("MEDIUM")
                    .trainingAdvice("Refresher simulation recommended within 14 days.")
                    .build();
            reportRepository.save(r2);
        }

        log.info("DisasterSim AI seed data ready: Admin user: admin@disastersim.ai | Employee: sarah.chen@enterprise.com");
    }
}
