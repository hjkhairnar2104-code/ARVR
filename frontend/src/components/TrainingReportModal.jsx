import React from 'react';
import {
  Award,
  Shield,
  Zap,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  RotateCcw,
  ArrowLeft,
  Clock,
  MapPin,
  Bot
} from 'lucide-react';

export const TrainingReportModal = ({ session, onRetake, onBackToDashboard }) => {
  const report = session?.report;
  const score = session?.score || report?.score || 0;
  const safety = session?.safetyScore || report?.safetyScore || 0;
  const decision = session?.decisionScore || report?.decisionScore || 0;
  const response = session?.responseScore || report?.responseScore || 0;
  const interaction = session?.interactionScore || report?.interactionScore || 0;
  const actions = session?.actions || [];

  const getRiskBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">LOW RISK</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40">MEDIUM RISK</span>;
      case 'HIGH':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-950 text-orange-300 border border-orange-500/40">HIGH RISK</span>;
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-500/40">CRITICAL RISK</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">ASSESSED</span>;
    }
  };

  const formatTimestamp = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col gap-6 py-6">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            {getRiskBadge(report?.riskLevel)}
            <span className="text-xs text-slate-400 font-mono">
              Session #{session?.id || 'LIVE'}
            </span>
          </div>
        </div>

        {/* Title & Score Hero Banner */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                Training Assessment Report
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {session?.scenario?.name || 'Office Disaster Simulation'}
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl">
                {session?.completionStatus === 'COMPLETED'
                  ? 'Evacuation drill successfully concluded. Action events analyzed by DisasterSim AI.'
                  : 'Evacuation protocol incomplete or terminated under critical exposure.'}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-inner">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Final Score</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl md:text-5xl font-black font-mono ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score.toFixed(1)}
                </span>
                <span className="text-slate-500 font-bold text-sm">/ 100</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Duration: {session?.responseTime?.toFixed(1) || 0}s
              </div>
            </div>
          </div>
        </div>

        {/* 4 Score Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Safety Behavior</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300">{safety.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 40</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(safety / 40) * 100}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Decision Making</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-300">{decision.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 25</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(decision / 25) * 100}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Response Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">{response.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 20</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(response / 20) * 100}%` }} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Interactions</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-300">{interaction.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 15</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(interaction / 15) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* AI Performance Evaluation Section */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-slate-700/80 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Performance Summary
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  Google Gemini Evaluator
                </span>
              </h2>
              <p className="text-xs text-slate-400">Deterministic event auditing with synthetic hallucination protection</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed">
            {report?.summary || 'Session analyzed successfully. Protocols and reaction timing benchmarked against enterprise safety standards.'}
          </div>

          {/* Strengths & Mistakes Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
              <div className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {report?.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">General compliance with evacuation drill.</li>
                )}
              </ul>
            </div>

            {/* Mistakes / Vulnerabilities */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40">
              <div className="text-xs uppercase font-bold text-red-400 flex items-center gap-2 mb-3">
                <AlertOctagon className="w-4 h-4" />
                <span>Tactical Errors & Delays</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {report?.mistakes && report.mistakes.length > 0 ? (
                  report.mistakes.map((mis, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">&bull;</span>
                      <span>{mis}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No high-risk errors observed.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations & Training Advice */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs uppercase font-bold text-sky-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Corrective Recommendations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report?.recommendations && report.recommendations.length > 0 ? (
                report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sky-400 font-bold">&bull;</span>
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li>Review emergency exit floor plan before subsequent drills.</li>
              )}
            </ul>

            {report?.trainingAdvice && (
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Supervisory Advice: </span>
                {report.trainingAdvice}
              </div>
            )}
          </div>
        </div>

        {/* Chronological Action Timeline */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-slate-700/80 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>Chronological Action Timeline</span>
            <span className="text-xs font-normal text-slate-400 font-mono">({actions.length} recorded events)</span>
          </h2>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            {actions.map((act, index) => (
              <div key={index} className="flex items-start gap-4 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  act.correct
                    ? 'bg-slate-900 border-emerald-500/60 text-emerald-400'
                    : 'bg-slate-900 border-red-500/60 text-red-400'
                }`}>
                  <span className="text-[10px] font-mono font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 glass-panel p-3 rounded-xl border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-bold text-slate-100 font-mono mr-2">
                      {act.actionType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {act.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {act.x !== undefined && (
                      <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                        [{act.x}, {act.z}]
                      </span>
                    )}
                    <span className="text-xs font-mono font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
                      {formatTimestamp(act.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-2xl glass-panel text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-sm transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Simulation Drill</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg flex items-center gap-2"
          >
            <span>Back to Employee Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
