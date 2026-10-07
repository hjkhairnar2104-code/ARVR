import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Procedural fire & smoke simulation with real-time foam suppression.
 * Features:
 * - Dynamic flame shrinkage as extinguisher foam is sprayed onto flame base
 * - Expanding white foam blanket piling up over burning surfaces
 * - Soot smoke transition into cooling white steam upon extinguishing
 * - Thermal light attenuation and danger radius collapse
 */
export const FireHazard = ({
  fireActive = false,
  flameIntensity = 1.0,
  smokeDensity = 0.5,
  dangerRadius = 5.0,
  isExtinguished = false,
  extinguishProgress = 0, // 0 to 100%
  fireExtinguisherUsed = false,
  origin = [-10, 0.2, -11],
}) => {
  const fireLightRef = useRef();
  const flameMeshGroupRef = useRef();
  const smokeParticlesRef = useRef();

  const effectiveFlame = isExtinguished ? 0 : Math.max(0, flameIntensity * (1.0 - extinguishProgress / 100));
  const effectiveSmoke = isExtinguished ? 0.15 : Math.max(0.1, smokeDensity * (1.0 - extinguishProgress / 140));

  // Procedural flame layers
  const flameCount = 14;
  const flameOffsets = useMemo(() => {
    return Array.from({ length: 16 }, () => ({
      x: (Math.random() - 0.5) * (dangerRadius * 0.4),
      z: (Math.random() - 0.5) * (dangerRadius * 0.4),
      scale: 0.8 + Math.random() * 0.8,
      speed: 3.0 + Math.random() * 4.0,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [dangerRadius]);

  // Smoke particle puffs
  const smokePuffs = useMemo(() => {
    return Array.from({ length: 24 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * (dangerRadius * 0.8),
        1.2 + Math.random() * 2.2,
        (Math.random() - 0.5) * (dangerRadius * 0.8)
      ),
      scale: 1.0 + Math.random() * 1.5,
      speed: 0.4 + Math.random() * 0.6,
      rotSpeed: (Math.random() - 0.5) * 0.5,
    }));
  }, [dangerRadius]);

  // Animation frame: flicker flame and rise smoke
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 1. Fire Light Flicker
    if (fireLightRef.current && fireActive) {
      if (effectiveFlame > 0.05) {
        fireLightRef.current.intensity =
          (effectiveFlame * 3.2) + Math.sin(time * 18.0) * 0.6 + Math.cos(time * 26.0) * 0.4;
      } else {
        fireLightRef.current.intensity = 0;
      }
    }

    // 2. Animate flame cones (shrinks with foam suppression!)
    if (flameMeshGroupRef.current && fireActive) {
      flameMeshGroupRef.current.children.forEach((child, i) => {
        const offset = flameOffsets[i % flameOffsets.length];
        const flicker = Math.sin(time * offset.speed + offset.phase);
        child.scale.y = offset.scale * (1.0 + flicker * 0.25) * effectiveFlame;
        child.scale.x = offset.scale * (1.0 - flicker * 0.15) * effectiveFlame;
        child.scale.z = child.scale.x;
      });
    }

    // 3. Animate rising smoke / cooling steam
    if (smokeParticlesRef.current && fireActive) {
      smokeParticlesRef.current.children.forEach((puff, i) => {
        const data = smokePuffs[i % smokePuffs.length];
        puff.position.y += data.speed * 0.015;
        puff.rotation.z += data.rotSpeed * 0.01;

        if (puff.position.y > 3.8) {
          puff.position.y = 1.0 + Math.random() * 0.3;
          puff.position.x = (Math.random() - 0.5) * (dangerRadius * 0.6);
          puff.position.z = (Math.random() - 0.5) * (dangerRadius * 0.6);
        }
      });
    }
  });

  if (!fireActive) return null;

  return (
    <group position={origin}>
      {/* Dynamic Thermal Point Light */}
      <pointLight
        ref={fireLightRef}
        position={[0, 1.2, 0]}
        color={effectiveFlame > 0.1 ? '#ff4500' : '#38bdf8'}
        distance={Math.max(6, dangerRadius * 2.0)}
        decay={2}
        intensity={effectiveFlame * 3.0}
      />

      {/* Burning Base Scorched Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[Math.min(dangerRadius * 0.4, 2.5), 16]} />
        <meshStandardMaterial
          color="#1a0a04"
          roughness={0.9}
        />
      </mesh>

      {/* Danger Zone Perimeter Ring (fades as fire is suppressed) */}
      {effectiveFlame > 0.05 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[Math.max(1.0, dangerRadius - 0.15), dangerRadius, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1.2 * effectiveFlame}
            transparent
            opacity={0.6 * effectiveFlame}
          />
        </mesh>
      )}

      {/* Interactive Flame Mesh Clusters */}
      <group ref={flameMeshGroupRef} visible={effectiveFlame > 0.01}>
        {flameOffsets.slice(0, flameCount).map((item, idx) => (
          <group key={idx} position={[item.x, 0, item.z]}>
            {/* Outer orange flame cone */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <coneGeometry args={[0.35, 1.6, 8]} />
              <meshStandardMaterial
                color="#ff4500"
                emissive="#ff2200"
                emissiveIntensity={2.0}
                roughness={0.2}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Core bright yellow flame */}
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[0.2, 1.0, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={3.0}
                transparent
                opacity={0.95}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= THICK FOAM BLANKET ON FIRE ================= */}
      {/* Piles up over the burning counter & floor as foam is discharged */}
      {(extinguishProgress > 0 || isExtinguished) && (
        <group position={[0, 0.1, 0]}>
          {/* Main foam smothering blanket */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[Math.min(2.8, 0.8 + (extinguishProgress / 100) * 1.8), 24]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#ffffff"
              emissiveIntensity={0.4}
              roughness={0.2}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Bubbly foam mounds piling on the counter surface */}
          {[-0.6, 0.0, 0.6, -0.3, 0.4].map((fx, idx) => (
            <mesh
              key={idx}
              position={[fx, 0.15 + (extinguishProgress / 100) * 0.15, (idx % 2 === 0 ? 0.3 : -0.3)]}
              scale={[
                0.3 + (extinguishProgress / 100) * 0.4,
                0.15 + (extinguishProgress / 100) * 0.25,
                0.3 + (extinguishProgress / 100) * 0.4
              ]}
            >
              <sphereGeometry args={[0.5, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#e2e8f0"
                emissiveIntensity={0.5}
                roughness={0.15}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Rising Smoke Plume Clusters (Dark soot during burning, White steam when extinguished) */}
      <group ref={smokeParticlesRef}>
        {smokePuffs.map((puff, idx) => (
          <mesh
            key={idx}
            position={[puff.pos.x, puff.pos.y, puff.pos.z]}
            scale={[puff.scale, puff.scale, puff.scale]}
          >
            <dodecahedronGeometry args={[0.45, 1]} />
            <meshStandardMaterial
              color={effectiveFlame > 0.1 ? '#334155' : '#f1f5f9'}
              roughness={1.0}
              transparent
              opacity={Math.min(0.55, effectiveSmoke * 0.5)}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
