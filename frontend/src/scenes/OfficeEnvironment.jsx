import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Procedural low-poly office building environment with scenario-specific enhancements.
 * Features:
 * - Dynamic lighting responding to Fire (red), Flood (amber/cyan + thunder), or Earthquake
 * - Ultra-high visibility Emergency Exit with LED contour, ISO exit beacon, and floor chevrons
 * - Scenario-specific FLOOD layout:
 *   * Breached glass entrance with incoming storm water surge
 *   * Interactive Main Circuit Breaker Panel (switch off to prevent electrocution!)
 *   * Interactive Flood Barrier gate at entrance
 *   * Interactive Floating Life Vest
 *   * Submerged electrical short hazards (sparking when breaker energized)
 *   * Elevated industrial dry refuge staircase
 */
export const OfficeEnvironment = ({
  isEmergency = false,
  alarmTriggered = false,
  extinguisherPicked = false,
  onInteractAlarm,
  onInteractExtinguisher,
  onInteractBreaker,
  onInteractBarrier,
  onInteractLifeVest,
  playerPos,
  currentScenario = 'FIRE',
  waterHeight = 0.1,
  waterLevel = 1,
  isBreakerOff = false,
  isFloodBarrierDeployed = false,
  isLifeVestAcquired = false,
}) => {
  const strobeLightRef = useRef();
  const exitBeaconLightRef = useRef();
  const sparkLightRef = useRef();
  const floodStrobeRef = useRef();
  const lightningLightRef = useRef();

  const isFlood = currentScenario === 'FLOOD';
  const isEarthquake = currentScenario === 'EARTHQUAKE';

  // Dynamic emergency beacon and atmospheric animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Red fire strobe
    if (strobeLightRef.current && (isEmergency || alarmTriggered) && !isFlood) {
      strobeLightRef.current.intensity = Math.sin(t * 9) > 0 ? 3.8 : 0.3;
    }

    // Amber/Cyan flood warning beacon
    if (floodStrobeRef.current && isFlood) {
      floodStrobeRef.current.intensity = (Math.sin(t * 6) + 1) * 2.2;
    }

    // High-visibility green emergency exit beacon
    if (exitBeaconLightRef.current) {
      exitBeaconLightRef.current.intensity = 2.2 + Math.sin(t * 4.5) * 1.5;
    }

    // Sparking electrical short circuit light (active ONLY when breaker is energized!)
    if (sparkLightRef.current && isFlood) {
      if (!isBreakerOff && waterHeight > 0.22) {
        sparkLightRef.current.intensity = Math.random() > 0.7 ? (Math.random() * 4.5 + 1.2) : 0;
      } else {
        sparkLightRef.current.intensity = 0;
      }
    }

    // Occasional lightning flash in flood storm
    if (lightningLightRef.current && isFlood) {
      const flash = Math.random() > 0.985 ? (Math.random() * 3.5 + 1.5) : 0;
      lightningLightRef.current.intensity = flash;
    }
  });

  return (
    <group>
      {/* ================= LIGHTING ================= */}
      <ambientLight intensity={isEmergency ? (isBreakerOff ? 0.18 : 0.3) : 0.8} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={isEmergency ? (isFlood ? 0.22 : 0.4) : 1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Lightning Flash Light for Storm */}
      {isFlood && (
        <directionalLight
          ref={lightningLightRef}
          position={[0, 25, 20]}
          color="#e0f2fe"
          intensity={0}
        />
      )}

      {/* Emergency red strobe lights (Fire / Earthquake) */}
      {(isEmergency || alarmTriggered) && !isFlood && (
        <>
          <pointLight
            ref={strobeLightRef}
            position={[0, 3.8, 0]}
            color="#ff1100"
            distance={28}
            decay={2}
          />
          <pointLight
            position={[10, 3.8, -5]}
            color="#ff2200"
            intensity={2.2}
            distance={16}
            decay={2}
          />
        </>
      )}

      {/* Flood emergency revolving beacons (Amber & Marine Blue) */}
      {isFlood && (
        <>
          <pointLight
            ref={floodStrobeRef}
            position={[0, 3.8, 2]}
            color="#f59e0b"
            distance={25}
            decay={2}
          />
          <pointLight
            position={[-5, 3.8, -6]}
            color="#0284c7"
            intensity={2.0}
            distance={20}
            decay={2}
          />
        </>
      )}

      {/* Ceiling fluorescent panels (normal office lighting) */}
      {!isEmergency && (
        <>
          <pointLight position={[-6, 3.8, -6]} intensity={0.9} distance={12} color="#f8fafc" />
          <pointLight position={[6, 3.8, -6]} intensity={0.9} distance={12} color="#f8fafc" />
          <pointLight position={[-6, 3.8, 6]} intensity={0.9} distance={12} color="#f8fafc" />
          <pointLight position={[6, 3.8, 6]} intensity={0.9} distance={12} color="#f8fafc" />
        </>
      )}

      {/* ================= GROUND & EXTERIOR ================= */}
      {/* Outside ground / parking lot */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={isFlood ? '#0f172a' : '#1e293b'} roughness={0.9} />
      </mesh>

      {/* Exterior Road markings & Sidewalk */}
      <mesh position={[0, -0.02, 19]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* ================= FLOOD SCENARIO EXTERIOR SWELL & RAIN ================= */}
      {isFlood && (
        <group>
          {/* Outdoor stormy water sheet */}
          <mesh position={[0, Math.min(waterHeight * 1.15, 1.4), 18]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[70, 24]} />
            <meshStandardMaterial color="#0369a1" roughness={0.1} metalness={0.8} transparent opacity={0.7} />
          </mesh>
          {/* Overcast stormy sky backdrop */}
          <mesh position={[0, 15, 30]}>
            <planeGeometry args={[90, 40]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      )}

      {/* ================= OFFICE INTERIOR FLOOR ================= */}
      <mesh position={[0, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial
          color={isFlood ? '#1e293b' : '#334155'}
          roughness={isFlood ? 0.3 : 0.65}
          metalness={isFlood ? 0.4 : 0.1}
        />
      </mesh>

      {/* Floor tiles grid pattern */}
      <gridHelper args={[30, 30, '#475569', '#334155']} position={[0, 0.02, -2]} />

      {/* ================= CEILING ================= */}
      <mesh position={[0, 4.0, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* ================= PERIMETER WALLS ================= */}
      {/* Back Wall (Z = -15) */}
      <mesh position={[0, 2, -15]} receiveShadow>
        <boxGeometry args={[30, 4, 0.3]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Left Wall (X = -15) */}
      <mesh position={[-15, 2, -2]} receiveShadow>
        <boxGeometry args={[0.3, 4, 26]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Right Wall (X = 15) with Emergency Exit opening */}
      <mesh position={[15, 2, -7.5]} receiveShadow>
        <boxGeometry args={[0.3, 4, 15]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Right Wall Doorway header above exit */}
      <mesh position={[15, 3.5, 2]} receiveShadow>
        <boxGeometry args={[0.3, 1, 4]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[15, 2, 8.5]} receiveShadow>
        <boxGeometry args={[0.3, 4, 9]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Front Wall (Z = 11) with Windows and Front Entrance */}
      <mesh position={[-8, 2, 11]} receiveShadow>
        <boxGeometry args={[14, 4, 0.3]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[8, 2, 11]} receiveShadow>
        <boxGeometry args={[14, 4, 0.3]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* ================= FRONT ENTRANCE BREACH & FLOOD BARRIER ================= */}
      {isFlood ? (
        <group position={[0, 0, 11]}>
          {/* Shattered glass double entrance frame */}
          <mesh position={[-1.2, 1.5, 0]}>
            <boxGeometry args={[0.1, 3.0, 0.1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[1.2, 1.5, 0]}>
            <boxGeometry args={[0.1, 3.0, 0.1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[0, 3.0, 0]}>
            <boxGeometry args={[2.5, 0.1, 0.1]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>

          {/* Buckled cracked glass panels */}
          <mesh position={[-0.6, 1.2, 0.2]} rotation={[0, 0.4, 0.15]}>
            <boxGeometry args={[1.0, 2.4, 0.03]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} roughness={0.1} />
          </mesh>

          {/* Churning surge water pouring into lobby */}
          {!isFloodBarrierDeployed && (
            <mesh position={[0, 0.15, -1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 3.5]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.7} transparent opacity={0.8} />
            </mesh>
          )}

          {/* Broken glass shards on floor */}
          {[-0.8, -0.2, 0.5, 0.9].map((gx, idx) => (
            <mesh key={idx} position={[gx, 0.05, -0.8 + idx * 0.3]} rotation={[0, idx * 0.7, 0]}>
              <boxGeometry args={[0.25, 0.02, 0.25]} />
              <meshStandardMaterial color="#bae6fd" roughness={0.2} metalness={0.8} transparent opacity={0.6} />
            </mesh>
          ))}

          {/* Ingress Warning Sign */}
          <mesh position={[0, 3.25, -0.1]}>
            <boxGeometry args={[2.2, 0.35, 0.05]} />
            <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.8} />
          </mesh>

          {/* INTERACTIVE FLOOD BARRIER */}
          <group position={[0, 0, -1.2]} onClick={onInteractBarrier} cursor="pointer">
            {isFloodBarrierDeployed ? (
              // DEPLOYED HEAVY ALUMINUM FLOOD BARRIER
              <group position={[0, 0.6, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[2.4, 1.2, 0.15]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Yellow/Black hazard stripe banner */}
                <mesh position={[0, 0.2, 0.08]}>
                  <planeGeometry args={[2.3, 0.3]} />
                  <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.5} />
                </mesh>
                {/* Status Indicator */}
                <mesh position={[0, 0.5, 0.08]}>
                  <boxGeometry args={[0.8, 0.15, 0.02]} />
                  <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} />
                </mesh>
              </group>
            ) : (
              // UNDEPLOYED BARRIER STACK WITH PROMPT INDICATOR
              <group position={[0, 0.1, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[2.4, 0.2, 0.35]} />
                  <meshStandardMaterial color="#ca8a04" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[1.6, 0.25, 0.05]} />
                  <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.0} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      ) : (
        /* Normal Glass Entrance Doors */
        <group position={[0, 1.5, 11]}>
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[1.1, 2.9, 0.05]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.35} roughness={0.1} />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[1.1, 2.9, 0.05]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* ================= INTERIOR PARTITION WALLS ================= */}
      {/* Corridor Wall dividing Open Office from Breakroom (Split with wide 4m open doorway!) */}
      {/* Left Wall Segment: X from -15 to -9.5 */}
      <mesh position={[-12.25, 2, -7]} receiveShadow>
        <boxGeometry args={[5.5, 4, 0.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Doorway Header / Lintel above open entrance: X from -9.5 to -5.5 */}
      <mesh position={[-7.5, 3.3, -7]} receiveShadow>
        <boxGeometry args={[4.0, 1.4, 0.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Right Wall Segment: X from -5.5 to +3 */}
      <mesh position={[-1.25, 2, -7]} receiveShadow>
        <boxGeometry args={[8.5, 4, 0.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Breakroom Enclosure Wall (X = -3, Z from -15 to -7) */}
      <mesh position={[-3, 2, -11]} receiveShadow>
        <boxGeometry args={[0.2, 4, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      <mesh position={[2, 1.2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 2.4, 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>

      {/* ================= INTERACTIVE MAIN CIRCUIT BREAKER PANEL ================= */}
      {/* Positioned on corridor wall at X = 7.0, Y = 1.6, Z = -7.0 */}
      {isFlood && (
        <group
          position={[7.0, 1.6, -6.85]}
          onClick={onInteractBreaker}
          cursor="pointer"
        >
          {/* Industrial metal breaker cabinet box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.0, 0.18]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Yellow High Voltage Warning Sign */}
          <mesh position={[0, 0.32, 0.1]}>
            <planeGeometry args={[0.45, 0.25]} />
            <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.6} />
          </mesh>

          {/* Master Knife-Switch Breaker Lever */}
          <group position={[0, -0.05, 0.1]} rotation={[isBreakerOff ? 0.6 : -0.6, 0, 0]}>
            {/* Lever Handle */}
            <mesh position={[0, 0.12, 0.05]}>
              <boxGeometry args={[0.08, 0.24, 0.06]} />
              <meshStandardMaterial
                color={isBreakerOff ? '#22c55e' : '#dc2626'}
                metalness={0.6}
              />
            </mesh>
            {/* Grip Knob */}
            <mesh position={[0, 0.24, 0.05]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>

          {/* Status Indicator LED Light */}
          <mesh position={[0.26, 0.32, 0.1]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial
              color={isBreakerOff ? '#22c55e' : '#ef4444'}
              emissive={isBreakerOff ? '#22c55e' : '#ef4444'}
              emissiveIntensity={2.5}
            />
          </mesh>

          {/* Breaker Instruction Plaque */}
          <mesh position={[0, -0.35, 0.1]}>
            <boxGeometry args={[0.65, 0.14, 0.02]} />
            <meshStandardMaterial
              color={isBreakerOff ? '#065f46' : '#991b1b'}
              emissive={isBreakerOff ? '#059669' : '#b91c1c'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      )}

      {/* ================= INTERACTIVE FLOATING EMERGENCY LIFE VEST ================= */}
      {isFlood && !isLifeVestAcquired && (
        <group
          position={[1.0, waterHeight + 0.05, 1.5]}
          onClick={onInteractLifeVest}
          cursor="pointer"
        >
          {/* Orange Marine Safety Vest Body */}
          <mesh rotation={[Math.PI / 2, 0, 0.4]} castShadow>
            <boxGeometry args={[0.45, 0.55, 0.14]} />
            <meshStandardMaterial color="#ea580c" roughness={0.5} />
          </mesh>
          {/* Silver SOLAS Reflective Strips */}
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0.4]}>
            <boxGeometry args={[0.42, 0.08, 0.15]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Flashing Locator Beacon */}
          <mesh position={[0.15, 0.1, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}

      {/* ================= WORKSTATIONS ================= */}
      <WorkstationDesk position={[-8, 0, 1]} rotation={0} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[-8, 0, 5]} rotation={0} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[-12, 0, 1]} rotation={Math.PI} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[-12, 0, 5]} rotation={Math.PI} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[6, 0, -2]} rotation={0} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[6, 0, 3]} rotation={0} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[10, 0, -2]} rotation={Math.PI} isFlood={isFlood} waterHeight={waterHeight} />
      <WorkstationDesk position={[10, 0, 3]} rotation={Math.PI} isFlood={isFlood} waterHeight={waterHeight} />

      {/* Breakroom Table & Cabinets */}
      <group position={[-9, 0, -11]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 1.0, 1.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
        <mesh position={[-0.8, 1.15, 0]} castShadow>
          <boxGeometry args={[0.7, 0.45, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.6, 1.2, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ================= SUBMERGED ELECTRICAL HAZARD (SPARKING) ================= */}
      {isFlood && (
        <group position={[-4, 0.35, -6.85]}>
          <mesh>
            <boxGeometry args={[0.15, 0.25, 0.05]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Sparking light - completely deactivated if breaker is switched off! */}
          <pointLight
            ref={sparkLightRef}
            position={[0, 0, 0.1]}
            color="#38bdf8"
            distance={8}
            decay={2}
          />
          {!isBreakerOff && waterHeight > 0.22 && (
            <mesh position={[0, 0.05, 0.05]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial
                color="#67e8f9"
                emissive="#38bdf8"
                emissiveIntensity={3.0}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}
        </group>
      )}

      {/* ================= FLOOD FLOATING DEBRIS ================= */}
      {isFlood && waterHeight > 0.12 && (
        <group>
          {/* Overturned floating office chair */}
          <mesh position={[4, waterHeight + 0.08, 1]} rotation={[1.4, 0.5, 0.8]}>
            <boxGeometry args={[0.5, 0.45, 0.5]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Drifting cardboard supply box */}
          <mesh position={[-1, waterHeight, -3]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.5]} />
            <meshStandardMaterial color="#b45309" roughness={0.9} />
          </mesh>
          {/* Floating water cooler bottle */}
          <mesh position={[1, waterHeight - 0.02, 1]} rotation={[0.4, 0.5, 1.2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* ================= ELEVATED 2ND FLOOR & STAIRCASE (DRY REFUGE) ================= */}
      <group position={[8, 0, -11]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => (
          <group key={step} position={[0, (step + 0.5) * 0.35, step * 0.45]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.35, 0.45]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.176, 0.2]}>
              <boxGeometry args={[2.5, 0.01, 0.06]} />
              <meshStandardMaterial
                color="#facc15"
                emissive="#eab308"
                emissiveIntensity={isFlood ? 1.0 : 0.4}
              />
            </mesh>
          </group>
        ))}

        <mesh position={[1.3, 2.0, 1.5]} rotation={[0.65, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-1.3, 2.0, 1.5]} rotation={[0.65, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </mesh>

        <mesh position={[0, 2.8, -2.5]} receiveShadow>
          <boxGeometry args={[5.8, 0.3, 4.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        <mesh position={[0, 3.4, -0.4]}>
          <boxGeometry args={[5.6, 0.9, 0.05]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>

        {/* HIGH GROUND SAFE REFUGE ILLUMINATED SIGN */}
        <group position={[0, 3.9, -4.4]}>
          <mesh>
            <boxGeometry args={[3.2, 0.65, 0.1]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={isFlood ? 2.5 : 1.2}
            />
          </mesh>
          <pointLight
            position={[0, 0, 0.3]}
            color="#38bdf8"
            intensity={isFlood ? 2.8 : 1.2}
            distance={10}
          />
        </group>

        {isFlood && (
          <group position={[-1.5, 3.1, -2.5]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.08, 16, 32]} />
              <meshStandardMaterial color="#ea580c" roughness={0.4} />
            </mesh>
            <mesh position={[1.0, 0.15, 0]}>
              <boxGeometry args={[0.45, 0.3, 0.3]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
          </group>
        )}
      </group>

      {/* ================= EMERGENCY FIRE ALARM PULL STATION ================= */}
      <group
        position={[-3.85, 1.5, -5]}
        onClick={onInteractAlarm}
        cursor="pointer"
      >
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.35, 0.25]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0.07, -0.04, 0]} castShadow>
          <boxGeometry args={[0.06, 0.14, 0.12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.07, 0.1, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial
            color={alarmTriggered ? '#22c55e' : '#f59e0b'}
            emissive={alarmTriggered ? '#22c55e' : '#f59e0b'}
            emissiveIntensity={1.8}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.05, 0.12, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      </group>

      {/* ================= FIRE EXTINGUISHER WALL MOUNT ================= */}
      {!extinguisherPicked && (
        <group
          position={[2.15, 1.2, 0]}
          onClick={onInteractExtinguisher}
          cursor="pointer"
        >
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.65, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.08, 0.1, 0.12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.05, 0.42, 0.06]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, 0.2, 0.12]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.4, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
        </group>
      )}

      {/* ================= ULTRA-HIGH VISIBILITY EMERGENCY EXIT ================= */}
      <group position={[14.8, 0, 2]}>
        {/* Neon Green LED Archway */}
        <mesh position={[-0.1, 1.5, -1.9]}>
          <boxGeometry args={[0.08, 3.1, 0.08]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
        </mesh>
        <mesh position={[-0.1, 1.5, 1.9]}>
          <boxGeometry args={[0.08, 3.1, 0.08]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
        </mesh>
        <mesh position={[-0.1, 3.05, 0]}>
          <boxGeometry args={[0.08, 0.08, 3.88]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
        </mesh>

        {/* Dual Green Doors */}
        <mesh position={[0, 1.5, -0.95]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.1, 2.9, 1.6]} />
          <meshStandardMaterial color="#047857" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.5, 0.95]} rotation={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.1, 2.9, 1.6]} />
          <meshStandardMaterial color="#047857" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[-0.07, 0.25, -0.95]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.45, 1.55]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
        <mesh position={[-0.07, 0.25, 0.95]} rotation={[0, -0.35, 0]}>
          <boxGeometry args={[0.06, 0.45, 1.55]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
        <mesh position={[-0.12, 1.2, -0.95]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.25]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.12, 1.2, 0.95]} rotation={[0, -0.35, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.25]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Illuminated Sign */}
        <group position={[-0.05, 3.4, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 0.6, 2.2]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3.2} roughness={0.1} />
          </mesh>
          <mesh position={[-0.11, 0, -0.6]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[-0.11, 0, 0.6]}>
            <planeGeometry args={[0.5, 0.35]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* Pulsing Beacon */}
        <mesh position={[-0.1, 3.85, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.25, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.5} />
        </mesh>
        <pointLight
          ref={exitBeaconLightRef}
          position={[-0.8, 3.4, 0]}
          color="#10b981"
          distance={15}
          decay={1.8}
        />
        <spotLight
          position={[-0.5, 3.8, 0]}
          target-position={[-0.5, 0, 0]}
          color="#34d399"
          intensity={3.0}
          distance={8}
          angle={0.65}
          penumbra={0.5}
        />

        {/* Glowing Floor Chevrons */}
        {[-4.5, -3.0, -1.5, 0.0].map((offsetX, idx) => (
          <group key={idx} position={[offsetX, 0.03, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.3, 1.2]} />
              <meshStandardMaterial color="#065f46" roughness={0.8} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.1, 0.22, 3]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Exterior Muster Point */}
      <group position={[23, 0.03, 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#064e3b" roughness={0.8} opacity={0.85} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[3.6, 4.0, 4]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[3.5, 2.0, 3.5]}>
          <cylinderGeometry args={[0.06, 0.06, 4, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} />
        </mesh>
        <mesh position={[3.5, 3.8, 3.5]}>
          <boxGeometry args={[0.1, 0.8, 0.8]} />
          <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={1.2} />
        </mesh>
        <pointLight position={[0, 2.5, 0]} color="#10b981" intensity={2.5} distance={12} />
      </group>
    </group>
  );
};

// Reusable Procedural Desk with Monitor and Ergonomic Chair
const WorkstationDesk = ({ position = [0, 0, 0], rotation = 0, isFlood = false, waterHeight = 0 }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.05, 1.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
      </mesh>
      <mesh position={[-0.9, 0.36, -0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.36, -0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[-0.9, 0.36, 0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.36, 0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.72]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      <mesh position={[0, 1.12, -0.2]} castShadow>
        <boxGeometry args={[0.85, 0.5, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.12, -0.17]}>
        <planeGeometry args={[0.8, 0.45]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive={isFlood ? '#ef4444' : '#0284c7'}
          emissiveIntensity={isFlood ? 0.6 : 0.35}
        />
      </mesh>
      <mesh position={[0, 0.84, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.18]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.76, -0.2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      <mesh position={[0, 0.76, 0.15]} castShadow>
        <boxGeometry args={[0.45, 0.02, 0.16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      <group position={[0, 0, 0.65]}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0.22]} castShadow>
          <boxGeometry args={[0.48, 0.6, 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.45]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 5]} />
          <meshStandardMaterial color="#334155" metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
