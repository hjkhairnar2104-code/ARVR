import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Lightweight procedural earthquake simulation.
 * Features:
 * - Dynamic camera shake applied via Three.js camera offset
 * - Swinging ceiling fixtures
 * - Falling ceiling tiles and acoustic debris
 * - Audio-visual tremor cues
 */
export const EarthquakeHazard = ({
  isShaking = false,
  tremorIntensity = 1.0, // 0 to 1
  isCoverTaken = false,
}) => {
  const { camera } = useThree();
  const hangingLightsRef = useRef();

  // Falling debris blocks
  const debrisBlocks = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: (Math.random() - 0.5) * 16,
      z: (Math.random() - 0.5) * 16,
      initialY: 3.8,
      fallSpeed: 2.5 + Math.random() * 2.5,
      rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      size: [0.6 + Math.random() * 0.4, 0.05, 0.6 + Math.random() * 0.4],
    }));
  }, []);

  const debrisRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Camera Tremor Shake
    if (isShaking) {
      const shakeAmt = tremorIntensity * (isCoverTaken ? 0.02 : 0.08);
      const shakeX = (Math.sin(t * 35.0) + Math.cos(t * 53.0)) * shakeAmt;
      const shakeY = (Math.cos(t * 42.0) + Math.sin(t * 61.0)) * shakeAmt * 0.7;

      camera.position.x += shakeX;
      camera.position.y += shakeY;
    }

    // 2. Swinging Ceiling Light Fixtures
    if (hangingLightsRef.current && isShaking) {
      const swingAngle = Math.sin(t * 6.0) * (0.25 * tremorIntensity);
      hangingLightsRef.current.children.forEach((light) => {
        light.rotation.z = swingAngle;
      });
    }

    // 3. Falling Debris animation
    if (debrisRef.current && isShaking) {
      debrisRef.current.children.forEach((mesh, idx) => {
        const item = debrisBlocks[idx];
        if (mesh.position.y > 0.05) {
          mesh.position.y -= item.fallSpeed * 0.016;
          mesh.rotateOnAxis(item.rotAxis, 0.05);
        } else {
          mesh.position.y = 0.03; // Landed on floor
        }
      });
    }
  });

  return (
    <group>
      {/* Hanging lights swinging during earthquake */}
      <group ref={hangingLightsRef}>
        <group position={[-4, 3.8, -2]}>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, -1.2, 0]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.3]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#f8fafc"
              emissiveIntensity={isShaking ? 0.3 : 1.0}
            />
          </mesh>
        </group>
        <group position={[4, 3.8, 2]}>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, -1.2, 0]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.3]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#f8fafc"
              emissiveIntensity={isShaking ? 0.3 : 1.0}
            />
          </mesh>
        </group>
      </group>

      {/* Falling Ceiling Acoustic Tiles / Plaster Debris */}
      {isShaking && (
        <group ref={debrisRef}>
          {debrisBlocks.map((d, i) => (
            <mesh
              key={i}
              position={[d.x, d.initialY, d.z]}
              castShadow
            >
              <boxGeometry args={d.size} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
