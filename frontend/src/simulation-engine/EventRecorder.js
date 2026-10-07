import { trainingService } from '../services/api';

/**
 * EventRecorder logs employee actions during the 3D disaster simulation.
 * It tracks chronological timestamps, positions, accuracy, and communicates
 * with the Spring Boot backend API.
 */
export class EventRecorder {
  constructor(sessionId, scenarioId, employeeId) {
    this.sessionId = sessionId;
    this.scenarioId = scenarioId;
    this.employeeId = employeeId;
    this.startTime = Date.now();
    this.events = [];
    this.recordedUniqueEvents = new Set();
  }

  getElapsedTime() {
    return (Date.now() - this.startTime) / 1000.0;
  }

  record(eventType, position = { x: 0, y: 0, z: 0 }, correct = true, description = '', onceOnlyKey = null) {
    if (onceOnlyKey) {
      if (this.recordedUniqueEvents.has(onceOnlyKey)) {
        return null;
      }
      this.recordedUniqueEvents.add(onceOnlyKey);
    }

    const timestamp = parseFloat(this.getElapsedTime().toFixed(1));
    const event = {
      actionType: eventType,
      timestamp,
      x: position ? parseFloat(position.x.toFixed(2)) : 0,
      y: position ? parseFloat(position.y.toFixed(2)) : 0,
      z: position ? parseFloat(position.z.toFixed(2)) : 0,
      correct,
      description: description || eventType.replace(/_/g, ' ').toLowerCase(),
    };

    this.events.push(event);

    // Send action to backend if sessionId is present
    if (this.sessionId) {
      trainingService.recordAction(this.sessionId, event).catch((err) => {
        console.warn('Could not sync action to backend:', err.message);
      });
    }

    return event;
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
    this.recordedUniqueEvents.clear();
    this.startTime = Date.now();
  }
}
