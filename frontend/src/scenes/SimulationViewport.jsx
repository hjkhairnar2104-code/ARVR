import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OfficeEnvironment } from './OfficeEnvironment';
import { PlayerController } from './PlayerController';
import { FireHazard } from '../simulations/FireHazard';
import { FloodHazard } from '../simulations/FloodHazard';
import { EarthquakeHazard } from '../simulations/EarthquakeHazard';
import { SimulationHUD } from '../components/SimulationHUD';
import { EventRecorder } from '../simulation-engine/EventRecorder';
import { inputManager } from '../simulation-engine/InputManager';
import { trainingService } from '../services/api';

export const SimulationViewport = ({
  scenario,
  session,
  user,
  onComplete,
  onExit,
}) => {
  // Timer & state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyText, setEmergencyText] = useState('');
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [extinguisherPicked, setExtinguisherPicked] = useState(false);
  const [fireExtinguisherUsed, setFireExtinguisherUsed] = useState(false);
  const [exitFound, setExitFound] = useState(false);
  const [safeZoneReached, setSafeZoneReached] = useState(false);
  const [isCoverTaken, setIsCoverTaken] = useState(false);
  const [isInDanger, setIsInDanger] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 1.6, z: 6 });
  const [isBreakerOff, setIsBreakerOff] = useState(false);
  const [isFloodBarrierDeployed, setIsFloodBarrierDeployed] = useState(false);
  const [isLifeVestAcquired, setIsLifeVestAcquired] = useState(false);
  const [extinguishProgress, setExtinguishProgress] = useState(0);
  const [isExtinguished, setIsExtinguished] = useState(false);

  // Fire Extinguisher P.A.S.S. Training States
  const [isPinPulled, setIsPinPulled] = useState(false);
  const [trainingStep, setTrainingStep] = useState(1); // 1: Pull Pin, 2: Open/Close Test, 3: Aim & Spray/Sweep, 4: Done
  const [valveOpen, setValveOpen] = useState(false);
  const [valveTested, setValveTested] = useState(false);
  const [isAimedAtBase, setIsAimedAtBase] = useState(false);
  const [trainingNotification, setTrainingNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  // Dynamic Hazard Variables
  const [smokeLevel, setSmokeLevel] = useState(0.1);
  const [dangerRadius, setDangerRadius] = useState(4.0);
  const [waterHeight, setWaterHeight] = useState(0.05);
  const [waterLevel, setWaterLevel] = useState(1);
  const [isEarthquakeShaking, setIsEarthquakeShaking] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);

  const eventRecorderRef = useRef(null);
  const completedRef = useRef(false);

  // Initialize EventRecorder and WebXR check
  useEffect(() => {
    if (session?.id) {
      eventRecorderRef.current = new EventRecorder(session.id, scenario?.id, user?.id);
    } else {
      eventRecorderRef.current = new EventRecorder(null, scenario?.id, user?.id);
    }

    inputManager.checkWebXRSupport().then((supported) => {
      setIsVRSupported(supported);
    });

    eventRecorderRef.current.record(
      'SIMULATION_STARTED',
      { x: 0, y: 1.6, z: 6 },
      true,
      `Employee entered 3D environment for ${scenario?.name || 'Simulation'}`
    );
  }, [session, scenario, user]);

  // Main Disaster Simulation Clock / Phase Timeline
  useEffect(() => {
    if (isPaused || completedRef.current) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const nextTime = prev + 1;

        // SCENARIO SPECIFIC TIMELINE
        if (scenario?.type === 'FIRE') {
          // After 4 seconds: Fire detected
          if (nextTime === 4 && !isEmergency) {
            setIsEmergency(true);
            setEmergencyText('🔥 FIRE DETECTED IN BREAKROOM — ACTIVATE ALARM & EVACUATE');
            eventRecorderRef.current?.record(
              'FIRE_DETECTED',
              { x: -10, y: 0.2, z: -11 },
              true,
              'Visible combustion and thermal ignition detected in kitchen breakroom',
              'fire_detected_first'
            );
          }
          // Spreading smoke and danger perimeter
          if (nextTime > 4) {
            setSmokeLevel((s) => Math.min(1.0, s + 0.008));
            setDangerRadius((r) => Math.min(8.5, r + 0.03));
          }
        } else if (scenario?.type === 'FLOOD') {
          if (nextTime === 3 && !isEmergency) {
            setIsEmergency(true);
            setEmergencyText('🌊 FLOOD LEVEL 1: WATER PENETRATING GROUND PERIMETER');
          }
          setWaterHeight((w) => {
            const ingressSpeed = isFloodBarrierDeployed ? 0.0025 : 0.008;
            const nextH = Math.min(1.6, w + ingressSpeed);
            if (nextH > 0.4 && waterLevel < 2) {
              setWaterLevel(2);
              setEmergencyText('🌊 FLOOD LEVEL 2: CORRIDOR INGRESS CONFIRMED — SEEK HIGH GROUND');
            } else if (nextH > 0.8 && waterLevel < 3) {
              setWaterLevel(3);
              setEmergencyText('🌊 FLOOD LEVEL 3: LOWER ROUTE UNSAFE — PROCEED TO ELEVATED REFUGE');
            } else if (nextH > 1.2 && waterLevel < 4) {
              setWaterLevel(4);
              setEmergencyText('🌊 FLOOD LEVEL 4: GROUND FLOOR HAZARDOUS');
            }
            return nextH;
          });
        } else if (scenario?.type === 'EARTHQUAKE') {
          if (nextTime === 4 && !isEmergency) {
            setIsEmergency(true);
            setIsEarthquakeShaking(true);
            setEmergencyText('🌎 SEISMIC TREMOR DETECTED — DROP, COVER & HOLD UNDER DESK!');
            eventRecorderRef.current?.record(
              'EARTHQUAKE_TREMOR_STARTED',
              playerPos,
              true,
              'Violent structural vibrations detected (Magnitude 6.8)',
              'earthquake_start'
            );
          }
          // Shaking terminates after 22 seconds
          if (nextTime >= 26 && isEarthquakeShaking) {
            setIsEarthquakeShaking(false);
            setEmergencyText('✅ TREMORS SUBSIDED — CAREFULLY EVACUATE VIA CLEAR EXITS');
            eventRecorderRef.current?.record(
              'TREMORS_STOPPED',
              playerPos,
              true,
              'Primary tremors terminated. Structural evacuation phase commenced.'
            );
          }
        }

        // Time Limit Expiry
        const maxDuration = scenario?.duration || 180;
        if (nextTime >= maxDuration && !completedRef.current) {
          triggerCompletion(false, 'Evacuation time limit expired before reaching safe zone');
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isEmergency, scenario, isEarthquakeShaking, waterLevel]);

  // Action Dispatcher
  const handleTriggerAction = (actionType, description, isTerminalSuccess = false, onceKey = null) => {
    if (completedRef.current) return;

    if (actionType === 'ALARM_TRIGGERED') {
      setAlarmTriggered(true);
    } else if (actionType === 'FIRE_EXTINGUISHER_PICKED') {
      setExtinguisherPicked(true);
      setTrainingStep(1);
      showNotification(
        'info',
        '🧯 EXTINGUISHER RETRIEVED: P.A.S.S. TRAINING STARTED',
        'Step 1 [PULL PIN]: Trigger is locked! Press [R], [P], or [E] to pull safety pin & break tamper seal.',
        6500
      );
    } else if (actionType === 'FIRE_EXTINGUISHER_USED') {
      setFireExtinguisherUsed(true);
      // Extinguishing reduces local danger radius
      setDangerRadius((r) => Math.max(3.0, r - 2.5));
    } else if (actionType === 'EXIT_FOUND') {
      setExitFound(true);
    } else if (actionType === 'DROP_COVER_HOLD') {
      setIsCoverTaken(true);
    } else if (actionType === 'MAIN_BREAKER_SHUTDOWN') {
      setIsBreakerOff(true);
      setEmergencyText('⚡ MAIN BREAKER DISCONNECTED — FLOOD ELECTROCUTION RISK NEUTRALIZED');
    } else if (actionType === 'FLOOD_BARRIER_DEPLOYED') {
      setIsFloodBarrierDeployed(true);
      setEmergencyText('🛡️ FLOOD DEFENSE BARRIER DEPLOYED — WATER INGRESS SLOWED');
    } else if (actionType === 'LIFE_VEST_ACQUIRED') {
      setIsLifeVestAcquired(true);
      setEmergencyText('🦺 EMERGENCY LIFE VEST EQUIPPED — WATER BUOYANCY ASSURED');
    } else if (actionType === 'SAFE_ZONE_REACHED' || actionType === 'ELEVATED_AREA_REACHED') {
      setSafeZoneReached(true);
    }

    eventRecorderRef.current?.record(actionType, playerPos, true, description, onceKey);

    if (isTerminalSuccess) {
      triggerCompletion(true, description);
    }
  };

  // Toast Notification Helper
  const showNotification = (type, title, message, duration = 4500) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setTrainingNotification({ id: Date.now(), type, title, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setTrainingNotification(null);
    }, duration);
  };

  // Extinguisher Training: Pull Pin
  const handlePullPin = () => {
    if (!isPinPulled) {
      setIsPinPulled(true);
      setTrainingStep(2);
      showNotification(
        'success',
        '✅ SAFETY PIN PULLED & TAMPER SEAL BROKEN',
        'Step 2 [TEST VALVE]: Extinguisher is armed! Hold [Left Click] to test OPEN valve, then RELEASE to CLOSE.',
        6500
      );
      eventRecorderRef.current?.record(
        'PASS_PIN_PULLED',
        playerPos,
        true,
        'Pulled safety pin and broke tamper seal to arm extinguisher',
        'pass_pin_pulled'
      );
    }
  };

  // Extinguisher Training: Trigger Locked Alert
  const handleTriggerLockedAlert = () => {
    showNotification(
      'warning',
      '⚠️ TRIGGER LOCKED!',
      'Extinguisher cannot discharge! Pull the safety pin first by pressing [R], [P], or [E].',
      3500
    );
  };

  // Extinguisher Training: Valve Open/Close State Change
  const handleValveChange = (isOpen) => {
    setValveOpen(isOpen);
    if (!valveTested && trainingStep === 2) {
      if (isOpen) {
        showNotification(
          'info',
          '💨 VALVE OPENED',
          'Chemical stream active! Now RELEASE Left Click to test closing the valve.',
          3000
        );
      } else {
        setValveTested(true);
        setTrainingStep(3);
        showNotification(
          'success',
          '✅ VALVE TEST COMPLETE (OPEN & CLOSED)',
          'Step 3 [AIM & SPRAY]: Walk to breakroom, aim nozzle at FLAME BASE, and hold Left Click to sweep and smother fire!',
          7500
        );
        eventRecorderRef.current?.record(
          'PASS_VALVE_TESTED',
          playerPos,
          true,
          'Successfully tested opening and closing fire extinguisher discharge valve',
          'pass_valve_tested'
        );
      }
    }
  };

  // Extinguisher Training: Aim Status
  const handleAimStatusChange = (isAimed) => {
    setIsAimedAtBase(isAimed);
  };

  // Foam Extinguishing Progress Handler
  const handleExtinguishProgress = (delta) => {
    if (isExtinguished) return;
    setExtinguishProgress((prev) => {
      const next = Math.min(100, prev + delta * 38);
      if (next >= 100) {
        setIsExtinguished(true);
        setFireExtinguisherUsed(true);
        setTrainingStep(4);
        showNotification(
          'success',
          '🏆 FIRE EXTINGUISHED! P.A.S.S. TRAINING COMPLETE',
          'Flames smothered with foam blanket! Proceed immediately to the illuminated Emergency Exit.',
          8000
        );
        setEmergencyText('✅ FIRE EXTINGUISHED! SMOTHERED WITH FOAM — PROCEED TO EMERGENCY EXIT');
        eventRecorderRef.current?.record(
          'FIRE_EXTINGUISHED',
          playerPos,
          true,
          'Successfully smothered and extinguished kitchen fire with foam blanket',
          'fire_extinguished_once'
        );
      }
      return next;
    });
  };

  // Complete Training Simulation
  const triggerCompletion = async (isSuccess, finalNote) => {
    if (completedRef.current) return;
    completedRef.current = true;

    const recordedEvents = eventRecorderRef.current ? eventRecorderRef.current.getEvents() : [];

    const payload = {
      responseTime: parseFloat(elapsedTime.toFixed(1)),
      completionStatus: isSuccess ? 'COMPLETED' : 'FAILED',
      actions: recordedEvents,
    };

    if (session?.id) {
      try {
        const completedSession = await trainingService.completeTraining(session.id, payload);
        onComplete?.(completedSession);
      } catch (err) {
        console.error('Failed to complete session on server:', err);
        // Fallback local completion object so report always renders
        onComplete?.({
          id: session.id,
          scenario,
          score: isSuccess ? 88.0 : 42.0,
          safetyScore: isSuccess ? 36.0 : 15.0,
          decisionScore: isSuccess ? 22.0 : 12.0,
          responseScore: isSuccess ? 18.0 : 8.0,
          interactionScore: isSuccess ? 12.0 : 7.0,
          responseTime: elapsedTime,
          completionStatus: isSuccess ? 'COMPLETED' : 'FAILED',
          actions: recordedEvents,
        });
      }
    } else {
      onComplete?.({
        scenario,
        score: isSuccess ? 88.0 : 42.0,
        responseTime: elapsedTime,
        completionStatus: isSuccess ? 'COMPLETED' : 'FAILED',
        actions: recordedEvents,
      });
    }
  };

  const remainingTime = (scenario?.duration || 180) - elapsedTime;

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Viewport */}
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 6], fov: 75 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        {/* Office Building Environment */}
        <OfficeEnvironment
          isEmergency={isEmergency}
          alarmTriggered={alarmTriggered}
          extinguisherPicked={extinguisherPicked}
          playerPos={playerPos}
          currentScenario={scenario?.type || 'FIRE'}
          waterHeight={waterHeight}
          waterLevel={waterLevel}
          isBreakerOff={isBreakerOff}
          isFloodBarrierDeployed={isFloodBarrierDeployed}
          isLifeVestAcquired={isLifeVestAcquired}
          onInteractAlarm={() => handleTriggerAction('ALARM_TRIGGERED', 'Pulled fire alarm pull station')}
          onInteractExtinguisher={() => {
            handleTriggerAction('FIRE_EXTINGUISHER_PICKED', 'Retrieved wall-mounted CO2 extinguisher');
            showNotification(
              'info',
              '🧯 P.A.S.S. TRAINING STARTED',
              'Step 1 [PULL PIN]: The extinguisher is locked! Press [R] to pull safety pin & break tamper seal.',
              6500
            );
          }}
          onInteractBreaker={() => handleTriggerAction('MAIN_BREAKER_SHUTDOWN', 'Shut down main electrical breaker')}
          onInteractBarrier={() => handleTriggerAction('FLOOD_BARRIER_DEPLOYED', 'Deployed flood defense barrier')}
          onInteractLifeVest={() => handleTriggerAction('LIFE_VEST_ACQUIRED', 'Equipped high-buoyancy life vest')}
        />

        {/* Hazard Simulations */}
        {scenario?.type === 'FIRE' && (
          <FireHazard
            fireActive={isEmergency}
            flameIntensity={Math.max(0, 1.0 - extinguishProgress / 100)}
            smokeDensity={smokeLevel}
            dangerRadius={isExtinguished ? 0 : Math.max(1.0, dangerRadius * (1.0 - extinguishProgress / 120))}
            isExtinguished={isExtinguished}
            extinguishProgress={extinguishProgress}
            fireExtinguisherUsed={fireExtinguisherUsed || extinguishProgress > 0}
          />
        )}

        {scenario?.type === 'FLOOD' && (
          <FloodHazard
            waterHeight={waterHeight}
            floodLevel={waterLevel}
          />
        )}

        {scenario?.type === 'EARTHQUAKE' && (
          <EarthquakeHazard
            isShaking={isEarthquakeShaking}
            tremorIntensity={1.0}
            isCoverTaken={isCoverTaken}
          />
        )}

        {/* First-person Desktop & WebXR Player Controller */}
        <PlayerController
          initialPosition={[0, 1.6, 6]}
          onPositionUpdate={(pos) => setPlayerPos({ x: pos.x, y: pos.y, z: pos.z })}
          onInteractionPrompt={setInteractionPrompt}
          onTriggerAction={handleTriggerAction}
          onDangerousZoneChange={setIsInDanger}
          isPaused={isPaused}
          alarmTriggered={alarmTriggered}
          extinguisherPicked={extinguisherPicked}
          fireExtinguisherUsed={fireExtinguisherUsed}
          isCoverTaken={isCoverTaken}
          currentScenario={scenario?.type || 'FIRE'}
          dangerRadius={dangerRadius}
          isBreakerOff={isBreakerOff}
          isFloodBarrierDeployed={isFloodBarrierDeployed}
          isLifeVestAcquired={isLifeVestAcquired}
          isPinPulled={isPinPulled}
          trainingStep={trainingStep}
          onPullPin={handlePullPin}
          onValveChange={handleValveChange}
          onTriggerLockedAlert={handleTriggerLockedAlert}
          onAimStatusChange={handleAimStatusChange}
          onExtinguishProgress={handleExtinguishProgress}
        />
      </Canvas>

      {/* Heads-Up Display (HUD) Overlay */}
      <SimulationHUD
        scenario={scenario}
        elapsedTime={elapsedTime}
        remainingTime={remainingTime}
        isEmergency={isEmergency}
        emergencyText={emergencyText}
        smokeLevel={smokeLevel}
        waterLevel={waterLevel}
        alarmTriggered={alarmTriggered}
        extinguisherPicked={extinguisherPicked}
        fireExtinguisherUsed={fireExtinguisherUsed}
        exitFound={exitFound}
        safeZoneReached={safeZoneReached}
        isCoverTaken={isCoverTaken}
        isBreakerOff={isBreakerOff}
        isFloodBarrierDeployed={isFloodBarrierDeployed}
        isLifeVestAcquired={isLifeVestAcquired}
        interactionPrompt={interactionPrompt}
        isInDanger={isInDanger}
        playerPos={playerPos}
        isVRSupported={isVRSupported}
        onEnterVR={() => {
          if (navigator.xr) {
            navigator.xr.requestSession('immersive-vr').catch((e) => alert(e.message));
          }
        }}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        trainingStep={trainingStep}
        isPinPulled={isPinPulled}
        valveOpen={valveOpen}
        valveTested={valveTested}
        isAimedAtBase={isAimedAtBase}
        trainingNotification={trainingNotification}
        onDismissNotification={() => setTrainingNotification(null)}
      />
    </div>
  );
};