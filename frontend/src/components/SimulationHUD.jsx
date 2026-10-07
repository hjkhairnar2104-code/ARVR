import React, { useState } from 'react';
import {
  Flame,
  Waves,
  Activity,
  AlertTriangle,
  Compass,
  Clock,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Glasses,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';

export const SimulationHUD = ({
  scenario,
  elapsedTime,
  remainingTime,
  isEmergency,
  emergencyText,
  smokeLevel = 0,
  waterLevel = 1,
  tremorPhase = 'SHAKING',
  alarmTriggered,
  extinguisherPicked,
  fireExtinguisherUsed,
  exitFound,
  safeZoneReached,
  isCoverTaken,
  isBreakerOff,
  isFloodBarrierDeployed,
  isLifeVestAcquired,
  interactionPrompt,
  isInDanger,
  playerPos,
  onEnterVR,
  isVRSupported,
  isPaused,
  onTogglePause,
  trainingStep = 1,
  isPinPulled = false,
  valveOpen = false,
  valveTested = false,
  isAimedAtBase = false,
  trainingNotification = null,
  onDismissNotification,
}) => {
  const [showVRModal, setShowVRModal] = useState(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVRClick = () => {
    if (!isVRSupported) {
      setShowVRModal(true);
    } else {
      onEnterVR?.();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-4 md:p-6">
      {/* Danger Red Perimeter Vignette */}
      {isInDanger && (
        <div className="absolute inset-0 border-8 border-red-600/60 shadow-[inset_0_0_80px_rgba(239,68,68,0.5)] pointer-events-none animate-pulse" />
      )}

      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between gap-4 pointer-events-auto">
        {/* Left: Scenario Info & Live Threat Banner */}
        <div className="flex flex-col gap-2">
          <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3 border-slate-700/60">
            {scenario?.type === 'FIRE' && <Flame className="w-6 h-6 text-orange-500 animate-pulse" />}
            {scenario?.type === 'FLOOD' && <Waves className="w-6 h-6 text-sky-400 animate-pulse" />}
            {scenario?.type === 'EARTHQUAKE' && <Activity className="w-6 h-6 text-amber-500 animate-pulse" />}
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {scenario?.name || 'Safety Drill'}
              </div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Status:
                {isEmergency ? (
                  <span className="text-red-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    EMERGENCY ACTIVE
                  </span>
                ) : (
                  <span className="text-emerald-400 font-mono">NORMAL MONITORING</span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Alert Banner */}
          {isEmergency && (
            <div className="glass-panel-danger px-4 py-2 rounded-xl flex items-center gap-2 text-red-200 text-xs md:text-sm font-semibold animate-bounce">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{emergencyText || 'HAZARD CONFIRMED — INITIATE PROTOCOL'}</span>
            </div>
          )}
        </div>

        {/* Center: Live Timers */}
        <div className="glass-panel px-5 py-2.5 rounded-xl border-slate-700/60 flex items-center gap-6 shadow-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Elapsed</div>
              <div className="font-mono text-base font-bold text-slate-100">{formatTime(elapsedTime)}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Time Limit</div>
            <div className={`font-mono text-base font-bold ${remainingTime < 30 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
              {formatTime(Math.max(0, remainingTime))}
            </div>
          </div>
        </div>

        {/* Right: Controls & VR Button */}
        <div className="flex items-center gap-2.5">
          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePause}
            className="glass-panel p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition"
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>

          {/* Enter VR Button */}
          <button
            onClick={handleVRClick}
            className="glass-panel px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm flex items-center gap-2 text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-700/50 transition cursor-pointer shadow-lg"
          >
            <Glasses className="w-4 h-4 text-indigo-400" />
            <span>Enter VR</span>
          </button>
        </div>
      </div>

      {/* ================= TRAINING NOTIFICATION TOAST ================= */}
      {trainingNotification && !isPaused && (
        <div className="self-center pointer-events-auto max-w-xl w-full px-4 animate-fade-in z-50">
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 transition-all ${
              trainingNotification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/70 text-amber-100 shadow-amber-900/40'
                : trainingNotification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/70 text-emerald-100 shadow-emerald-900/40'
                : 'bg-indigo-950/90 border-indigo-500/70 text-indigo-100 shadow-indigo-900/40'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-black/40 shrink-0">
              {trainingNotification.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              ) : trainingNotification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Flame className="w-5 h-5 text-sky-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                  P.A.S.S. Training
                </span>
                <span className="text-xs md:text-sm font-bold truncate">{trainingNotification.title}</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-medium">{trainingNotification.message}</p>
            </div>
            <button
              onClick={onDismissNotification}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"
              title="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= CENTER: INTERACTIVE ACTION PROMPT ================= */}
      {interactionPrompt && !isPaused && (
        <div className="self-center pointer-events-auto">
          <div className="glass-panel px-6 py-3 rounded-full border-amber-500/50 bg-amber-950/80 text-amber-200 text-sm md:text-base font-bold shadow-2xl flex items-center gap-3 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>{interactionPrompt}</span>
          </div>
        </div>
      )}

      {/* ================= BOTTOM BAR ================= */}
      <div className="flex items-end justify-between gap-4 pointer-events-auto flex-wrap md:flex-nowrap">
        {/* Objectives Checklist Card */}
        <div className="glass-panel p-3.5 rounded-2xl border-slate-700/60 w-72 md:w-80 shadow-2xl shrink-0">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Safety Checklist</span>
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-1.5 text-xs">
            {scenario?.type === 'FIRE' && (
              <>
                <div className={`flex items-center gap-2 ${alarmTriggered ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {alarmTriggered ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Trigger Fire Pull Station</span>
                </div>
                <div className={`flex items-center gap-2 ${exitFound ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {exitFound ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Identify Emergency Exit</span>
                </div>
                <div className={`flex items-center gap-2 ${extinguisherPicked ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {extinguisherPicked ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />}
                  <span>(Optional) Secure Extinguisher</span>
                </div>
                <div className={`flex items-center gap-2 ${safeZoneReached ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {safeZoneReached ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Evacuate to Exterior Safe Zone</span>
                </div>
              </>
            )}

            {scenario?.type === 'FLOOD' && (
              <>
                <div className={`flex items-center gap-2 ${isBreakerOff ? 'text-emerald-400 font-semibold' : 'text-amber-300'}`}>
                  {isBreakerOff ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-amber-400 shrink-0" />}
                  <span>Disconnect Main Breaker</span>
                </div>
                <div className={`flex items-center gap-2 ${isFloodBarrierDeployed ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isFloodBarrierDeployed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Deploy Entrance Flood Barrier</span>
                </div>
                <div className={`flex items-center gap-2 ${isLifeVestAcquired ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isLifeVestAcquired ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />}
                  <span>(Optional) Don Safety Life Vest</span>
                </div>
                <div className={`flex items-center gap-2 ${safeZoneReached ? 'text-emerald-400 font-semibold' : 'text-sky-300'}`}>
                  {safeZoneReached ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-sky-400 shrink-0" />}
                  <span>Ascend to 2nd-Floor Dry Refuge</span>
                </div>
              </>
            )}

            {scenario?.type === 'EARTHQUAKE' && (
              <>
                <div className={`flex items-center gap-2 ${isCoverTaken ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isCoverTaken ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Drop, Cover & Hold Under Desk</span>
                </div>
                <div className={`flex items-center gap-2 ${safeZoneReached ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {safeZoneReached ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />}
                  <span>Evacuate via Clear Corridor</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* P.A.S.S. Fire Extinguisher Training HUD Card */}
        {extinguisherPicked && scenario?.type === 'FIRE' && (
          <div className="glass-panel p-3.5 rounded-2xl border-sky-500/50 w-72 md:w-80 shadow-2xl bg-slate-900/90 shrink-0 animate-fade-in">
            <div className="text-xs uppercase font-black text-sky-300 tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-sky-400" />
                P.A.S.S. Extinguisher Drill
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-600/50 text-sky-300 font-bold">
                Step {trainingStep}/3
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* P - Pull Pin */}
              <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${isPinPulled ? 'bg-emerald-950/40 text-emerald-300' : 'bg-amber-950/50 text-amber-200 border border-amber-600/40 animate-pulse'}`}>
                <div className="flex items-center gap-2">
                  {isPinPulled ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-amber-400 shrink-0 animate-ping" />}
                  <span className="font-semibold">P - Pull Safety Pin</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-bold">
                  {isPinPulled ? 'PULLED' : '[R] KEY'}
                </span>
              </div>

              {/* A - Aim at Base */}
              <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${isAimedAtBase ? 'bg-emerald-950/40 text-emerald-300' : trainingStep >= 2 ? 'bg-sky-950/40 text-sky-200' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2">
                  {isAimedAtBase ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />}
                  <span className="font-semibold">A - Aim at Flame Base</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-bold">
                  {isAimedAtBase ? 'ON TARGET' : 'AIM MOUSE'}
                </span>
              </div>

              {/* S - Squeeze / Test Valve */}
              <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${valveTested ? 'bg-emerald-950/40 text-emerald-300' : isPinPulled ? 'bg-indigo-950/40 text-indigo-200' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2">
                  {valveTested ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />}
                  <span className="font-semibold">S - Squeeze Valve</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-bold">
                  {valveOpen ? '🟢 OPEN' : '⚪ CLOSED'}
                </span>
              </div>

              {/* S - Sweep Foam */}
              <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${fireExtinguisherUsed ? 'bg-emerald-950/40 text-emerald-300' : valveTested ? 'bg-sky-950/40 text-sky-200' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2">
                  {fireExtinguisherUsed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />}
                  <span className="font-semibold">S - Sweep & Smother</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-bold">
                  {fireExtinguisherUsed ? 'SMOTHERED' : 'LEFT CLICK'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hazard Metrics HUD (Smoke / Water / Tremor) */}
        <div className="glass-panel p-3.5 rounded-2xl border-slate-700/60 w-56 md:w-64 shadow-2xl flex flex-col gap-2">
          {scenario?.type === 'FIRE' && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Smoke Density</span>
                <span className="font-mono font-bold text-orange-400">{Math.round(smokeLevel * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, smokeLevel * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-slate-400 font-medium">Thermal Exposure</span>
                <span className={`font-mono font-bold ${isInDanger ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {isInDanger ? 'HAZARDOUS' : 'NOMINAL'}
                </span>
              </div>
            </>
          )}

          {scenario?.type === 'FLOOD' && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Water Stage</span>
                <span className="font-mono font-bold text-sky-400">LEVEL {waterLevel} / 4</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(waterLevel / 4) * 100}%` }}
                />
              </div>
            </>
          )}

          {scenario?.type === 'EARTHQUAKE' && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Tremor Magnitude</span>
                <span className="font-mono font-bold text-amber-400">6.8 Richter</span>
              </div>
              <div className="text-xs text-slate-300">
                Action: {isCoverTaken ? <span className="text-emerald-400 font-bold">COVER SECURED</span> : <span className="text-amber-400 font-bold animate-pulse">SEEK COVER UNDER DESK</span>}
              </div>
            </>
          )}
        </div>

        {/* Tactical Minimap Radar / Position Compass */}
        <div className="glass-panel p-3 rounded-2xl border-slate-700/60 hidden sm:flex flex-col items-center gap-1.5 shadow-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Emergency Beacon</span>
          </div>
          {/* Circular Radar Plot */}
          <div className="w-20 h-20 rounded-full border border-slate-700 bg-slate-900/90 relative flex items-center justify-center overflow-hidden">
            {/* Radar Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-slate-800" />
              <div className="h-full w-px bg-slate-800 absolute" />
              <div className="w-12 h-12 rounded-full border border-slate-800/80" />
            </div>
            {/* Player Marker (Center) */}
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-white z-10" />
            {/* Exit Beacon Marker (pointing toward X=23, Z=2) */}
            <div
              className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping"
              style={{
                top: `${Math.max(10, Math.min(70, 40 - (playerPos ? playerPos.z - 2 : 0) * 1.5))}px`,
                left: `${Math.max(10, Math.min(70, 40 + (23 - (playerPos ? playerPos.x : 0)) * 1.5))}px`,
              }}
            />
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span>Exit &rarr;</span>
            <span>{playerPos ? `${Math.round(Math.hypot(23 - playerPos.x, 2 - playerPos.z))}m` : '20m'}</span>
          </div>
        </div>
      </div>

      {/* ================= WebXR Fallback Modal ================= */}
      {showVRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border-slate-700 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center mx-auto mb-4">
              <Glasses className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">WebXR VR Information</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              VR mode requires a WebXR-compatible browser (e.g., Meta Quest Browser, Chrome with WebXR enabled) and a tethered or standalone VR headset.
              <br /><br />
              The simulation is fully playable in Desktop 3D Mode with full mouse and keyboard controls.
            </p>
            <button
              onClick={() => setShowVRModal(false)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Continue in Desktop Mode
            </button>
          </div>
        </div>
      )}

      {/* ================= PAUSE OVERLAY ================= */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4 pointer-events-auto">
          <div className="glass-panel p-8 rounded-2xl max-w-lg w-full border-slate-700 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Simulation Paused</h2>
            <p className="text-sm text-slate-400 mb-6">Review safety objectives or adjust controls.</p>

            <div className="bg-slate-900/80 rounded-xl p-4 text-left space-y-2 mb-6 text-xs text-slate-300 font-mono">
              <div className="text-slate-400 font-bold uppercase tracking-wider mb-2">Control Guide</div>
              <div className="flex justify-between"><span>[W][A][S][D]</span><span className="text-slate-100">Move Forward / Left / Back / Right</span></div>
              <div className="flex justify-between"><span>[Mouse]</span><span className="text-slate-100">Look Around / Aim</span></div>
              <div className="flex justify-between"><span>[E]</span><span className="text-slate-100">Interact (Alarm / Extinguisher)</span></div>
              <div className="flex justify-between"><span>[C] or [Ctrl]</span><span className="text-slate-100">Crouch / Drop & Cover</span></div>
              <div className="flex justify-between"><span>[ESC]</span><span className="text-slate-100">Pause / Release Cursor</span></div>
            </div>

            <button
              onClick={onTogglePause}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Resume Training Drill</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
