import * as THREE from 'three';

/**
 * Unified InputManager abstraction isolating 3D simulation logic
 * from physical hardware (Desktop WASD/Mouse vs WebXR 6DoF Controllers).
 */
export class InputManager {
  constructor() {
    this.mode = 'DESKTOP'; // 'DESKTOP' | 'VR'
    this.movement = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector2(0, 0); // yaw, pitch
    this.interactPressed = false;
    this.crouchPressed = false;
    this.pausePressed = false;

    // Desktop Input State
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      interact: false,
      crouch: false,
      pause: false,
    };

    // VR Input State
    this.vrControllers = [];
    this.teleportTarget = null;
    this.isWebXRSupported = false;

    this.checkWebXRSupport();
    this.bindDesktopEvents();
  }

  async checkWebXRSupport() {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      try {
        this.isWebXRSupported = await navigator.xr.isSessionSupported('immersive-vr');
      } catch (e) {
        this.isWebXRSupported = false;
      }
    } else {
      this.isWebXRSupported = false;
    }
    return this.isWebXRSupported;
  }

  setMode(mode) {
    this.mode = mode;
  }

  bindDesktopEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyE':
          this.keys.interact = true;
          this.interactPressed = true;
          break;
        case 'KeyC':
        case 'ControlLeft':
          this.keys.crouch = true;
          this.crouchPressed = true;
          break;
        case 'Escape':
          this.keys.pause = true;
          this.pausePressed = true;
          break;
        default:
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'KeyE':
          this.keys.interact = false;
          this.interactPressed = false;
          break;
        case 'KeyC':
        case 'ControlLeft':
          this.keys.crouch = false;
          this.crouchPressed = false;
          break;
        case 'Escape':
          this.keys.pause = false;
          break;
        default:
          break;
      }
    });
  }

  /**
   * Called by the simulation engine every frame.
   * Returns a normalized movement vector (X = lateral, Z = forward/back).
   */
  getMovementVector() {
    this.movement.set(0, 0, 0);

    if (this.mode === 'DESKTOP') {
      if (this.keys.forward) this.movement.z -= 1;
      if (this.keys.backward) this.movement.z += 1;
      if (this.keys.left) this.movement.x -= 1;
      if (this.keys.right) this.movement.x += 1;

      if (this.movement.lengthSq() > 0) {
        this.movement.normalize();
      }
    } else if (this.mode === 'VR') {
      // In VR mode, retrieve thumbstick axis from active XR controllers
      for (const controller of this.vrControllers) {
        if (controller && controller.gamepad && controller.gamepad.axes) {
          const [thumbX, thumbY] = controller.gamepad.axes.slice(2, 4);
          if (Math.abs(thumbX) > 0.1) this.movement.x += thumbX;
          if (Math.abs(thumbY) > 0.1) this.movement.z += thumbY;
        }
      }
      if (this.movement.lengthSq() > 1.0) {
        this.movement.normalize();
      }
    }

    return this.movement;
  }

  isInteracting() {
    if (this.mode === 'DESKTOP') {
      const active = this.interactPressed;
      return active;
    } else {
      // VR trigger button press
      return this.vrControllers.some(c => c && c.gamepad && c.gamepad.buttons && c.gamepad.buttons[0]?.pressed);
    }
  }

  consumeInteraction() {
    this.interactPressed = false;
    this.keys.interact = false;
  }

  isCrouching() {
    return this.crouchPressed || this.keys.crouch;
  }

  isPausing() {
    return this.pausePressed;
  }

  consumePause() {
    this.pausePressed = false;
    this.keys.pause = false;
  }

  registerVRControllers(controllers) {
    this.vrControllers = controllers;
    this.mode = 'VR';
  }

  setTeleportTarget(point) {
    this.teleportTarget = point;
  }

  consumeTeleportTarget() {
    const target = this.teleportTarget;
    this.teleportTarget = null;
    return target;
  }
}

// Global singleton instance
export const inputManager = new InputManager();
