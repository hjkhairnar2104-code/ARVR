import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { inputManager } from '../simulation-engine/InputManager';

// Precise AABB obstacle bounding boxes matching OfficeEnvironment.jsx
const OBSTACLES = [
  // Perimeter boundaries (except exit door at X=15, Z in [0.2, 3.8])
  { minX: -16.0, maxX: 16.0, minZ: -16.0, maxZ: -14.6 }, // Back Wall
  { minX: -16.0, maxX: -14.6, minZ: -16.0, maxZ: 12.0 }, // Left Wall
  { minX: -16.0, maxX: 16.0, minZ: 10.7, maxZ: 13.0 },  // Front Wall
  { minX: 14.6, maxX: 16.0, minZ: -16.0, maxZ: 0.2 },   // Right Wall North of Exit
  { minX: 14.6, maxX: 16.0, minZ: 3.8, maxZ: 12.0 },    // Right Wall South of Exit

  // Interior solid walls (Wide 4m open doorway between X = -9.5 and X = -5.5)
  { minX: -16.0, maxX: -9.5, minZ: -7.3, maxZ: -6.7 },
  { minX: -5.5, maxX: 3.5, minZ: -7.3, maxZ: -6.7 },
  { minX: -3.25, maxX: -2.75, minZ: -15.0, maxZ: -6.8 },
  { minX: 1.85, maxX: 2.15, minZ: -5.0, maxZ: 5.0 },
  { minX: -11.0, maxX: -7.0, minZ: -11.8, maxZ: -10.2 },

  // Desks Cluster 1
  { minX: -9.2, maxX: -6.8, minZ: 0.3, maxZ: 1.7 },
  { minX: -9.2, maxX: -6.8, minZ: 4.3, maxZ: 5.7 },
  { minX: -13.2, maxX: -10.8, minZ: 0.3, maxZ: 1.7 },
  { minX: -13.2, maxX: -10.8, minZ: 4.3, maxZ: 5.7 },

  // Desks Cluster 2
  { minX: 4.8, maxX: 7.2, minZ: -2.7, maxZ: -1.3 },
  { minX: 4.8, maxX: 7.2, minZ: 2.3, maxZ: 3.7 },
  { minX: 8.8, maxX: 11.2, minZ: -2.7, maxZ: -1.3 },
  { minX: 8.8, maxX: 11.2, minZ: 2.3, maxZ: 3.7 },
];

const PLAYER_RADIUS = 0.42;

/**
 * Procedural First-Person Arms and Hands Rig.
 * Renders in camera space:
 * - Empty-handed: Natural walking sway with protective gloves & safety sleeves
 * - Reaching / Touch: Hand extends forward to touch / grab / pull interactables
 * - Extinguisher Held: Dual hands gripping carry handle and discharge hose
 * - Extinguisher Spraying: Squeezes trigger, shakes with recoil, emits dense foam spray
 */
const FirstPersonPlayerRig = ({
  extinguisherPicked = false,
  isSpraying = false,
  isReaching = false,
  isWalking = false,
  isPinPulled = false,
}) => {
  const rigGroupRef = useRef();
  const triggerRef = useRef();
  const nozzleRef = useRef();
  const foamParticlesRef = useRef([]);

  // Particle pool for long-range foam spray (65 dense particles)
  const particleCount = 65;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      pos: new THREE.Vector3(0, 0, 0),
      vel: new THREE.Vector3(0, 0, 0),
      life: 0,
      scale: 1,
    }));
  }, []);

  useFrame(({ clock, camera }, delta) => {
    // Keep rig locked to camera position & orientation
    if (rigGroupRef.current) {
      rigGroupRef.current.position.copy(camera.position);
      rigGroupRef.current.quaternion.copy(camera.quaternion);
    }

    const t = clock.getElapsedTime();

    // Trigger squeeze animation (only depresses if safety pin is pulled!)
    if (triggerRef.current) {
      const targetRot = isSpraying && isPinPulled ? -0.25 : 0;
      triggerRef.current.rotation.x = THREE.MathUtils.lerp(triggerRef.current.rotation.x, targetRot, delta * 20);
    }

    // Update foam particles (only emits if pin pulled!)
    foamParticlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];
      if (isSpraying && isPinPulled && p.life <= 0) {
        // Spawn from nozzle tip (local offset) and project high velocity cone 9-11 meters forward
        p.pos.set(0.04, -0.06, -0.42);
        p.vel.set(
          (Math.random() - 0.5) * 0.7,
          (Math.random() - 0.3) * 0.5,
          -9.5 - Math.random() * 4.5
        );
        p.life = 0.85 + Math.random() * 0.35;
        p.scale = 0.05 + Math.random() * 0.04;
      }

      if (p.life > 0) {
        p.life -= delta;
        p.pos.addScaledVector(p.vel, delta);
        p.scale += delta * 0.42; // Expanding thick foam cloud
        mesh.visible = true;
        mesh.position.copy(p.pos);
        mesh.scale.setScalar(p.scale);
      } else {
        mesh.visible = false;
      }
    });
  });

  return (
    <group ref={rigGroupRef}>
      {/* ========================================================================= */}
      {/* 1. HOLDING FIRE EXTINGUISHER WITH BOTH HANDS                              */}
      {/* ========================================================================= */}
      {extinguisherPicked ? (
        <group
          position={[0.12, isSpraying ? -0.19 : -0.22, -0.38]}
          rotation={[isSpraying ? 0.06 : 0.04, -0.08, 0.03]}
        >
          {/* ============ RIGHT ARM & HAND (GRIPPING HANDLE & TRIGGER) ============ */}
          {/* Forearm (Navy uniform sleeve) */}
          <mesh position={[0.18, -0.16, 0.18]} rotation={[-0.8, -0.2, 0.4]}>
            <cylinderGeometry args={[0.05, 0.06, 0.32, 12]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
          {/* High-visibility orange safety cuff & reflective stripe */}
          <mesh position={[0.11, -0.06, 0.1]} rotation={[-0.8, -0.2, 0.4]}>
            <cylinderGeometry args={[0.052, 0.052, 0.06, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.5} />
          </mesh>
          <mesh position={[0.1, -0.04, 0.08]} rotation={[-0.8, -0.2, 0.4]}>
            <cylinderGeometry args={[0.054, 0.054, 0.015, 12]} />
            <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Right Protective Work Glove */}
          <mesh position={[0.06, 0.02, 0.01]} rotation={[0.2, -0.3, 0.1]}>
            <boxGeometry args={[0.07, 0.05, 0.09]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {/* Fingers curled around handle */}
          <mesh position={[0.03, 0.04, -0.01]}>
            <boxGeometry args={[0.025, 0.045, 0.07]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* ============ LEFT ARM & HAND (AIMING NOZZLE HOSE) ============ */}
          {/* Left Forearm */}
          <mesh position={[-0.2, -0.18, 0.12]} rotation={[-0.6, 0.35, -0.5]}>
            <cylinderGeometry args={[0.048, 0.058, 0.3, 12]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
          </mesh>
          <mesh position={[-0.12, -0.08, 0.04]} rotation={[-0.6, 0.35, -0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.5} />
          </mesh>
          {/* Left Glove holding flexible nozzle */}
          <mesh position={[-0.03, -0.04, -0.22]} rotation={[0.4, 0.2, -0.2]}>
            <boxGeometry args={[0.065, 0.05, 0.08]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>

          {/* ============ EXTINGUISHER CYLINDER & HARDWARE ============ */}
          {/* Main red tank */}
          <mesh position={[0, -0.08, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.34, 20]} />
            <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <sphereGeometry args={[0.07, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.07, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.25} />
          </mesh>
          {/* Inspection decal */}
          <mesh position={[0, -0.08, 0.072]}>
            <planeGeometry args={[0.08, 0.16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Valve head & top handle */}
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.022, 0.03, 0.035, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.09]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Squeeze trigger lever (animated) */}
          <mesh ref={triggerRef} position={[0, 0.18, -0.02]}>
            <boxGeometry args={[0.025, 0.012, 0.08]} />
            <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Safety Pull-Pin with Ring and Yellow Tamper Seal (Visible when NOT pulled) */}
          {!isPinPulled && (
            <group position={[0.022, 0.175, -0.015]} rotation={[0, 0, Math.PI / 2]}>
              {/* Steel Pin Shaft */}
              <mesh>
                <cylinderGeometry args={[0.005, 0.005, 0.045, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Circular Pull-Ring */}
              <mesh position={[0, -0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.018, 0.0035, 8, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Yellow Plastic Tamper Seal */}
              <mesh position={[0, 0.012, 0]}>
                <boxGeometry args={[0.012, 0.016, 0.012]} />
                <meshStandardMaterial color="#facc15" roughness={0.4} />
              </mesh>
            </group>
          )}
          {/* Pressure gauge */}
          <mesh position={[-0.03, 0.145, 0.025]} rotation={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.01, 16]} />
            <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Flexible discharge hose */}
          <mesh position={[-0.02, 0.05, -0.09]} rotation={[0.4, -0.1, 0.3]}>
            <cylinderGeometry args={[0.01, 0.01, 0.2, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Conical nozzle horn pointing forward */}
          <mesh ref={nozzleRef} position={[0.02, -0.05, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.012, 0.12, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.4} />
          </mesh>

          {/* Foam particles emitted forward */}
          {particles.map((_, idx) => (
            <mesh
              key={idx}
              ref={(el) => (foamParticlesRef.current[idx] = el)}
              visible={false}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial
                color="#f8fafc"
                emissive="#ffffff"
                emissiveIntensity={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      ) : (
        /* ========================================================================= */
        /* 2. EMPTY-HANDED / REACHING TO TOUCH & PICK UP                             */
        /* ========================================================================= */
        <group position={[0, -0.22, -0.35]}>
          {/* RIGHT ARM & HAND (Reaches out when isReaching is true!) */}
          <group
            position={isReaching ? [0.08, 0.08, -0.14] : [0.2, -0.04, 0]}
            rotation={isReaching ? [-0.3, -0.2, 0.1] : [-0.5, -0.1, 0.2]}
          >
            {/* Forearm */}
            <mesh position={[0, -0.12, 0.14]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.055, 0.28, 12]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            {/* Orange cuff */}
            <mesh position={[0, -0.02, 0.08]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.05, 12]} />
              <meshStandardMaterial color="#f97316" roughness={0.5} />
            </mesh>
            {/* Right Work Glove (Hand open or grasping) */}
            <mesh position={[0, 0.04, 0.02]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.065, 0.045, 0.08]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            {/* Fingers reaching out */}
            <mesh position={[0, 0.07, -0.03]} rotation={isReaching ? [-0.2, 0, 0] : [0.4, 0, 0]}>
              <boxGeometry args={[0.06, 0.02, 0.06]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>

          {/* LEFT ARM & HAND (Natural peripheral view) */}
          <group position={[-0.2, -0.06, 0]} rotation={[-0.5, 0.1, -0.2]}>
            <mesh position={[0, -0.12, 0.14]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.055, 0.28, 12]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.02, 0.08]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.05, 12]} />
              <meshStandardMaterial color="#f97316" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.04, 0.02]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.065, 0.045, 0.08]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

export const PlayerController = ({
  initialPosition = [0, 1.6, 6],
  onPositionUpdate,
  onInteractionPrompt,
  onTriggerAction,
  onDangerousZoneChange,
  onExtinguishProgress,
  isPaused = false,
  alarmTriggered = false,
  extinguisherPicked = false,
  fireExtinguisherUsed = false,
  isCoverTaken = false,
  currentScenario = 'FIRE',
  hazardPos = { x: -10, y: 0, z: -11 },
  dangerRadius = 5.0,
  isBreakerOff = false,
  isFloodBarrierDeployed = false,
  isLifeVestAcquired = false,
  isPinPulled = false,
  trainingStep = 1,
  onPullPin,
  onValveChange,
  onTriggerLockedAlert,
  onAimStatusChange,
}) => {
  const { camera, gl } = useThree();
  const playerPosRef = useRef(new THREE.Vector3(...initialPosition));
  const velocityRef = useRef(new THREE.Vector3());
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isPointerLocked = useRef(false);
  const isMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isSpraying, setIsSpraying] = useState(false);
  const [isReaching, setIsReaching] = useState(false);
  const [isWalking, setIsWalking] = useState(false);

  // Sound / vibration or alert flags
  const inDangerRef = useRef(false);
  const foundExitRef = useRef(false);
  const reachedSafeZoneRef = useRef(false);

  // Trigger brief reaching animation
  const triggerReachAnimation = () => {
    setIsReaching(true);
    setTimeout(() => setIsReaching(false), 550);
  };

  // Setup Camera and 360 Mouse Controls
  useEffect(() => {
    camera.position.copy(playerPosRef.current);
    camera.rotation.order = 'YXZ';

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    // Full 360 unconstrained horizontal rotation
    const handleMouseMove = (event) => {
      if (isPaused) return;

      let movementX = 0;
      let movementY = 0;

      if (isPointerLocked.current) {
        movementX = event.movementX || 0;
        movementY = event.movementY || 0;
      } else if (isMouseDown.current) {
        movementX = event.clientX - lastMousePos.current.x;
        movementY = event.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: event.clientX, y: event.clientY };
      } else {
        return;
      }

      eulerRef.current.y -= movementX * 0.0024;
      eulerRef.current.x -= movementY * 0.0024;
      // Clamp pitch (-85deg to 85deg)
      eulerRef.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, eulerRef.current.x));

      camera.quaternion.setFromEuler(eulerRef.current);
    };

    const handleMouseDownEvt = (event) => {
      if (isPaused) return;
      isMouseDown.current = true;
      lastMousePos.current = { x: event.clientX, y: event.clientY };

      if (event.button === 0 && extinguisherPicked) {
        if (!isPinPulled) {
          onTriggerLockedAlert?.();
          return;
        }
        setIsSpraying(true);
        onValveChange?.(true);
      }

      if (!isPointerLocked.current && event.button === 0) {
        gl.domElement.requestPointerLock?.();
      }
    };

    const handleMouseUpEvt = () => {
      isMouseDown.current = false;
      if (extinguisherPicked) {
        setIsSpraying(false);
        onValveChange?.(false);
      }
    };

    const handleKeyDown = (e) => {
      if (isPaused) return;
      if ((e.code === 'KeyR' || e.key === 'r' || e.key === 'R') && extinguisherPicked && !isPinPulled) {
        triggerReachAnimation();
        onPullPin?.();
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDownEvt);
    window.addEventListener('mouseup', handleMouseUpEvt);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDownEvt);
      window.removeEventListener('mouseup', handleMouseUpEvt);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [camera, gl.domElement, isPaused, extinguisherPicked, isPinPulled, onPullPin, onValveChange, onTriggerLockedAlert]);

  // Main Simulation & Collision Loop
  useFrame((_, delta) => {
    if (isPaused) return;

    // Arrow keys for 360 yaw rotation
    if (inputManager.isKeyDown?.('ArrowLeft')) {
      eulerRef.current.y += delta * 2.2;
      camera.quaternion.setFromEuler(eulerRef.current);
    }
    if (inputManager.isKeyDown?.('ArrowRight')) {
      eulerRef.current.y -= delta * 2.2;
      camera.quaternion.setFromEuler(eulerRef.current);
    }

    // Locomotion
    const moveInput = inputManager.getMovementVector();
    const speed = inputManager.isCrouching() ? 2.5 : 5.0;
    setIsWalking(moveInput.lengthSq() > 0.01);

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), eulerRef.current.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), eulerRef.current.y);

    const desiredMove = new THREE.Vector3();
    desiredMove.addScaledVector(forward, -moveInput.z);
    desiredMove.addScaledVector(right, moveInput.x);

    velocityRef.current.lerp(desiredMove.multiplyScalar(speed), delta * 12);
    const stepMove = velocityRef.current.clone().multiplyScalar(delta);

    // Sliding AABB Collision System
    const currentX = playerPosRef.current.x;
    const currentZ = playerPosRef.current.z;
    let newX = currentX + stepMove.x;
    let newZ = currentZ + stepMove.z;

    const inExitOpening = currentZ >= 0.2 && currentZ <= 3.8 && currentX >= 14.0;

    if (inExitOpening || newX > 14.5) {
      newX = Math.max(-14.2, Math.min(27.0, newX));
      newZ = Math.max(-0.5, Math.min(4.5, newZ));
    } else {
      // Test X
      for (const obs of OBSTACLES) {
        const isCollidingX =
          newX + PLAYER_RADIUS > obs.minX &&
          newX - PLAYER_RADIUS < obs.maxX &&
          currentZ + PLAYER_RADIUS > obs.minZ &&
          currentZ - PLAYER_RADIUS < obs.maxZ;

        if (isCollidingX) {
          if (currentX <= obs.minX) newX = Math.min(newX, obs.minX - PLAYER_RADIUS);
          else if (currentX >= obs.maxX) newX = Math.max(newX, obs.maxX + PLAYER_RADIUS);
          else newX = currentX;
        }
      }

      // Test Z
      for (const obs of OBSTACLES) {
        const isCollidingZ =
          newX + PLAYER_RADIUS > obs.minX &&
          newX - PLAYER_RADIUS < obs.maxX &&
          newZ + PLAYER_RADIUS > obs.minZ &&
          newZ - PLAYER_RADIUS < obs.maxZ;

        if (isCollidingZ) {
          if (currentZ <= obs.minZ) newZ = Math.min(newZ, obs.minZ - PLAYER_RADIUS);
          else if (currentZ >= obs.maxZ) newZ = Math.max(newZ, obs.maxZ + PLAYER_RADIUS);
          else newZ = currentZ;
        }
      }
    }

    playerPosRef.current.x = newX;
    playerPosRef.current.z = newZ;

    // Camera height (crouching vs standing)
    const targetHeight = inputManager.isCrouching() ? 1.0 : 1.65;
    playerPosRef.current.y = THREE.MathUtils.lerp(playerPosRef.current.y, targetHeight, delta * 8);

    camera.position.copy(playerPosRef.current);

    if (onPositionUpdate) {
      onPositionUpdate(playerPosRef.current);
    }

    // 3. Proximity Checks & Interactive Prompts
    let prompt = null;

    // Alarm station at [-3.85, 1.5, -5]
    const distToAlarm = playerPosRef.current.distanceTo(new THREE.Vector3(-3.85, 1.5, -5));
    if (distToAlarm < 2.2 && !alarmTriggered) {
      prompt = 'Press [E] to Reach Out & Pull Emergency Alarm';
      if (inputManager.isInteracting()) {
        inputManager.consumeInteraction();
        triggerReachAnimation();
        onTriggerAction('ALARM_TRIGGERED', 'Pulled emergency fire alarm pull station');
      }
    }

    // Fire Extinguisher at [2.15, 1.2, 0]
    const distToExtinguisher = playerPosRef.current.distanceTo(new THREE.Vector3(2.15, 1.2, 0));
    if (distToExtinguisher < 2.0 && !extinguisherPicked) {
      prompt = 'Press [E] to Reach Out & Pick Up Fire Extinguisher';
      if (inputManager.isInteracting()) {
        inputManager.consumeInteraction();
        triggerReachAnimation();
        onTriggerAction('FIRE_EXTINGUISHER_PICKED', 'Retrieved wall-mounted CO2 extinguisher');
      }
    }

    // Extinguisher usage and PASS training sequence
    if (extinguisherPicked) {
      const distToFire = playerPosRef.current.distanceTo(new THREE.Vector3(hazardPos.x, 1.0, hazardPos.z));

      // Test aim at fire base
      const firePos = new THREE.Vector3(hazardPos.x, 0.8, hazardPos.z);
      const toFire = firePos.clone().sub(playerPosRef.current).normalize();
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(eulerRef.current);
      const dot = forward.dot(toFire);
      const isAimedAtFire = distToFire < 9.5 && dot > 0.35;
      onAimStatusChange?.(isAimedAtFire);

      // Contextual step prompt
      if (!isPinPulled) {
        prompt = 'STEP 1: Press [R] to Pull Safety Pin and Arm Extinguisher';
      } else if (trainingStep === 2) {
        prompt = 'STEP 2: Hold [Left Click] to Test OPEN Valve, then Release to CLOSE';
      } else if (trainingStep === 3) {
        if (isAimedAtFire) {
          prompt = 'STEP 3: Hold [Left Click] to Spray & Sweep Foam across Flame Base!';
        } else {
          prompt = 'STEP 3: Aim Nozzle at Base of Fire (Move Mouse toward Fire)';
        }
      }

      // Check spacebar or interact key to spray
      if (inputManager.isInteracting() || inputManager.isKeyDown?.('Space')) {
        if (!isPinPulled) {
          onTriggerLockedAlert?.();
        } else {
          setIsSpraying(true);
          onValveChange?.(true);
        }
      }

      if (isSpraying && isPinPulled && isAimedAtFire) {
        onExtinguishProgress?.(delta);
        if (!fireExtinguisherUsed) {
          onTriggerAction('FIRE_EXTINGUISHER_USED', 'Discharged extinguisher foam toward flame base');
        }
      }
    }

    // FLOOD INTERACTIVE ELEMENTS
    if (currentScenario === 'FLOOD') {
      // 1. Circuit Breaker Panel at [7.0, 1.6, -7.0]
      const distToBreaker = playerPosRef.current.distanceTo(new THREE.Vector3(7.0, 1.6, -7.0));
      if (distToBreaker < 2.2 && !isBreakerOff) {
        prompt = 'Press [E] to Cut Main Electrical Breaker (Prevent Water Electrocution!)';
        if (inputManager.isInteracting()) {
          inputManager.consumeInteraction();
          triggerReachAnimation();
          onTriggerAction('MAIN_BREAKER_SHUTDOWN', 'Shut down ground floor master electrical breaker panel');
        }
      }

      // 2. Flood Barrier at [0, 0.5, 9.8]
      const distToBarrier = playerPosRef.current.distanceTo(new THREE.Vector3(0, 0.5, 9.8));
      if (distToBarrier < 2.5 && !isFloodBarrierDeployed) {
        prompt = 'Press [E] to Deploy Steel Flood Defense Barrier at Entrance';
        if (inputManager.isInteracting()) {
          inputManager.consumeInteraction();
          triggerReachAnimation();
          onTriggerAction('FLOOD_BARRIER_DEPLOYED', 'Deployed emergency flood defense barrier at entrance');
        }
      }

      // 3. Floating Safety Life Vest at [1.0, 0.3, 1.5]
      const distToVest = playerPosRef.current.distanceTo(new THREE.Vector3(1.0, 0.3, 1.5));
      if (distToVest < 2.2 && !isLifeVestAcquired) {
        prompt = 'Press [E] to Pick Up & Don High-Buoyancy Safety Life Vest';
        if (inputManager.isInteracting()) {
          inputManager.consumeInteraction();
          triggerReachAnimation();
          onTriggerAction('LIFE_VEST_ACQUIRED', 'Equipped high-buoyancy marine emergency life vest');
        }
      }

      // 4. Elevated Refuge Stairs at [8, 0, -11]
      const distToStairs = playerPosRef.current.distanceTo(new THREE.Vector3(8, playerPosRef.current.y, -11));
      if (distToStairs < 3.2) {
        prompt = 'Ascending reinforced stairs to 2nd-floor dry safe refuge';
        playerPosRef.current.y = Math.min(2.8, playerPosRef.current.y + delta * 2.2);
        if (playerPosRef.current.y >= 2.5) {
          onTriggerAction('ELEVATED_AREA_REACHED', 'Reached dry elevated 2nd-floor refuge platform', true);
        }
      }
    }

    // Earthquake Drop & Cover
    if (currentScenario === 'EARTHQUAKE') {
      const deskPositions = [
        [-8, 0, 1], [-8, 0, 5], [-12, 0, 1], [-12, 0, 5],
        [6, 0, -2], [6, 0, 3], [10, 0, -2], [10, 0, 3]
      ];
      const nearDesk = deskPositions.some(([dx, dy, dz]) =>
        playerPosRef.current.distanceTo(new THREE.Vector3(dx, dy, dz)) < 1.8
      );

      if (nearDesk && !isCoverTaken) {
        prompt = 'Press [C] to Drop, Cover & Hold under desk';
        if (inputManager.isCrouching() || inputManager.isInteracting()) {
          inputManager.consumeInteraction();
          onTriggerAction('DROP_COVER_HOLD', 'Took immediate cover beneath sturdy office desk');
        }
      }
    }

    // Emergency Exit door proximity (X = 14.8, Z = 2)
    const distToExit = playerPosRef.current.distanceTo(new THREE.Vector3(14.8, 1.5, 2));
    if (distToExit < 3.2 && !foundExitRef.current) {
      foundExitRef.current = true;
      onTriggerAction('EXIT_FOUND', 'Located illuminated emergency exit door');
    }

    // Safe Zone assembly muster point (X = 23, Z = 2)
    const distToSafeZone = playerPosRef.current.distanceTo(new THREE.Vector3(23, 0, 2));
    if (distToSafeZone < 4.8 && !reachedSafeZoneRef.current) {
      reachedSafeZoneRef.current = true;
      onTriggerAction('SAFE_ZONE_REACHED', 'Arrived safely at exterior muster assembly point', true);
    }

    // Danger Zone Proximity Check
    const distToHazard = playerPosRef.current.distanceTo(new THREE.Vector3(hazardPos.x, playerPosRef.current.y, hazardPos.z));
    const isInsideDanger = distToHazard < dangerRadius;

    if (isInsideDanger && !inDangerRef.current) {
      inDangerRef.current = true;
      onDangerousZoneChange?.(true);
      onTriggerAction('DANGEROUS_AREA_ENTERED', `Entered active hazard zone (${distToHazard.toFixed(1)}m from core)`, false);
    } else if (!isInsideDanger && inDangerRef.current) {
      inDangerRef.current = false;
      onDangerousZoneChange?.(false);
    }

    if (onInteractionPrompt) {
      onInteractionPrompt(prompt);
    }
  });

  return (
    <FirstPersonPlayerRig
      extinguisherPicked={extinguisherPicked}
      isSpraying={isSpraying}
      isReaching={isReaching}
      isWalking={isWalking}
      isPinPulled={isPinPulled}
    />
  );
};