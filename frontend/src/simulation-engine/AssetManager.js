import * as THREE from 'three';

/**
 * AssetManager handles loading 3D assets (GLTF/GLB) with automatic
 * graceful fallback to procedural Three.js geometry if models are missing.
 * Prevents download blocking and crashes on standard laptops.
 */
class AssetManager {
  constructor() {
    this.cache = new Map();
    this.fallbackRegistry = new Map();
    this.missingAssets = new Set();
  }

  registerFallback(assetKey, proceduralFactory) {
    this.fallbackRegistry.set(assetKey, proceduralFactory);
  }

  isMissing(assetKey) {
    return this.missingAssets.has(assetKey);
  }

  markMissing(assetKey) {
    this.missingAssets.add(assetKey);
  }

  getFallback(assetKey) {
    const factory = this.fallbackRegistry.get(assetKey);
    if (factory) {
      return factory();
    }
    return this.createGenericFallback(assetKey);
  }

  createGenericFallback(assetKey) {
    const group = new THREE.Group();
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }
}

export const assetManager = new AssetManager();
