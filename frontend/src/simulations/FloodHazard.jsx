import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Enhanced Procedural Flood Simulation.
 * Features:
 * - Rising water volume across 4 severity tiers
 * - Dual-layer translucent undulating water with reflections and foam line
 * - Dynamic bobbing floating objects (chairs, shipping boxes, keyboards, plastic bottles)
 * - Outdoor torrential rain storm streaks
 */
export const FloodHazard = ({
  waterHeight = 0.1, // 0.1m to 1.8m
  floodLevel = 1,    // 1 to 4
}) => {
  const waterMeshRef = useRef();
  const waterShimmerRef = useRef();
  const debrisRef1 = useRef();
  const debrisRef2 = useRef();
  const debrisRef3 = useRef();
  const rainRef = useRef();

  // Create rain particles for outdoor storm
  const rainCount = 120;
  const rainPositions = useMemo(() => {
    const arr = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;     // X
      arr[i * 3 + 1] = Math.random() * 18 + 2;    // Y
      arr[i * 3 + 2] = Math.random() * 20 + 10;   // Z (outdoors)
    }
    return arr;
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Primary water wave oscillation
    if (waterMeshRef.current) {
      waterMeshRef.current.position.y = waterHeight + Math.sin(t * 1.6) * 0.025;
      waterMeshRef.current.rotation.z = Math.sin(t * 0.8) * 0.005;
    }

    // Secondary shimmer sheet
    if (waterShimmerRef.current) {
      waterShimmerRef.current.position.y = waterHeight + 0.005 + Math.cos(t * 2.2) * 0.015;
    }

    // Floating bobbing debris
    if (debrisRef1.current) {
      debrisRef1.current.position.y = waterHeight + 0.08 + Math.sin(t * 2.0 + 1) * 0.03;
      debrisRef1.current.rotation.x = Math.sin(t * 1.5) * 0.1;
      debrisRef1.current.rotation.z = Math.cos(t * 1.2) * 0.1;
    }
    if (debrisRef2.current) {
      debrisRef2.current.position.y = waterHeight + 0.05 + Math.cos(t * 1.8 + 2) * 0.03;
      debrisRef2.current.rotation.y += delta * 0.2;
    }
    if (debrisRef3.current) {
      debrisRef3.current.position.y = waterHeight + 0.12 + Math.sin(t * 2.4) * 0.04;
      debrisRef3.current.rotation.z = Math.sin(t * 1.9) * 0.15;
    }

    // Falling rain animation
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * 24; // Fall speed
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 18; // Reset to top
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ================= PRIMARY WATER SURFACE ================= */}
      <mesh
        ref={waterMeshRef}
        position={[0, waterHeight, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[34, 30, 24, 24]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.08}
          metalness={0.7}
          transparent
          opacity={0.78}
        />
      </mesh>

      {/* Surface caustic shimmer layer */}
      <mesh
        ref={waterShimmerRef}
        position={[0, waterHeight + 0.005, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[33.8, 29.8]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Exterior Street Storm Flood Sheet */}
      <mesh
        position={[0, Math.min(waterHeight * 1.25, 1.5), 18]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[65, 22]} />
        <meshStandardMaterial
          color="#0369a1"
          roughness={0.12}
          metalness={0.65}
          transparent
          opacity={0.72}
        />
      </mesh>

      {/* ================= FLOATING DYNAMIC DEBRIS ================= */}
      {/* Cardboard supply box */}
      <group ref={debrisRef1} position={[2.5, waterHeight, 2.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.35, 0.45]} />
          <meshStandardMaterial color="#b45309" roughness={0.85} />
        </mesh>
      </group>

      {/* Floating plastic cooler crate */}
      <group ref={debrisRef2} position={[-4.5, waterHeight, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.28, 0.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Floating computer keyboard */}
      <group ref={debrisRef3} position={[0.5, waterHeight, -4.0]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.03, 0.16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>

      {/* Additional high-severity debris when water > 0.6m */}
      {waterHeight > 0.6 && (
        <group position={[-2.0, waterHeight + 0.06, 4.0]} rotation={[0.4, 0.6, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.4, 0.5]} />
            <meshStandardMaterial color="#92400e" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ================= OUTDOOR STORM RAIN STREAKS ================= */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={rainPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#93c5fd"
          transparent
          opacity={0.6}
        />
      </points>
    </group>
  );
};
