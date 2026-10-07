import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Waves,
  Activity,
  Shield,
  Bot,
  Glasses,
  BarChart3,
  Layers,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Lock,
  ChevronRight,
  Building2,
  Zap
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user, quickLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">DisasterSim</span>
              <span className="text-orange-500 font-bold ml-1 text-sm tracking-wider uppercase font-mono">AI</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#scenarios" className="hover:text-white transition">Scenarios</a>
            <a href="#technology" className="hover:text-white transition">3D Engine</a>
            <a href="#ai-assessment" className="hover:text-white transition">AI Assessment</a>
            <a href="#webxr" className="hover:text-white transition">WebXR VR</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition shadow-lg flex items-center gap-2"
              >
                <span>Enter Workspace ({user?.name.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-semibold transition"
                >
                  Log In
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-sky-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-orange-400 mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>Enterprise Safety & Regulatory Compliance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Immersive 3D Disaster Simulation &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              AI-Powered Safety Training
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Prepare personnel for workplace catastrophes through high-fidelity, lightweight 3D drills built with Three.js and WebXR. Every decision, latency, and egress route is evaluated by Gemini AI with zero synthetic hallucination.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-base transition shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2 group"
            >
              <span>Launch Training Session</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => quickLogin('EMPLOYEE')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Quick 1-Click Employee Demo</span>
            </button>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-slate-800/80">
            <div className="text-left glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Procedural 3D (No Unity/Unreal)</div>
            </div>
            <div className="text-left glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">WebXR</div>
              <div className="text-xs text-slate-400 mt-1">Unified Desktop &amp; VR Ready</div>
            </div>
            <div className="text-left glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-2xl md:text-3xl font-extrabold text-amber-400 font-mono">4-Tier</div>
              <div className="text-xs text-slate-400 mt-1">Configurable Scoring Engine</div>
            </div>
            <div className="text-left glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-2xl md:text-3xl font-extrabold text-indigo-400 font-mono">Gemini AI</div>
              <div className="text-xs text-slate-400 mt-1">Real Event Auditing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <section id="scenarios" className="py-20 px-6 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs uppercase font-bold tracking-widest text-orange-400 mb-2">Simulated Emergencies</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Realistic 3D Disaster Scenarios</h2>
            <p className="text-sm text-slate-400 mt-3">
              Engineered to test situational awareness, rapid triage, egress speed, and regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Scenario 1: Fire */}
            <div className="glass-panel rounded-3xl p-6 border-slate-800 hover:border-orange-500/50 transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center mb-6 text-orange-500">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase font-bold text-orange-400 tracking-wider">Scenario 01</div>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">Office Fire Evacuation</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Sudden combustion in breakroom. Personnel must activate pull stations, navigate expanding thermal smoke plumes, locate emergency exits, and arrive at the exterior muster point.
                </p>
                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Manual Alarm Station Pull</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> CO2 Extinguisher Retrieval</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-orange-400" /> Dynamic Smoke &amp; Heat Zones</div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Duration: 180s</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-950/80 text-orange-300 font-mono font-bold border border-orange-800/60">MEDIUM</span>
              </div>
            </div>

            {/* Scenario 2: Flood */}
            <div className="glass-panel rounded-3xl p-6 border-slate-800 hover:border-sky-500/50 transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center mb-6 text-sky-400">
                  <Waves className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase font-bold text-sky-400 tracking-wider">Scenario 02</div>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">Office Flood Emergency</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Severe external inundation breaches ground floor. Water levels rise across 4 severity stages. Employees must evade electrical danger zones and access upper floor stairwells.
                </p>
                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> 4-Stage Rising Water Plane</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Floating Debris Obstacles</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Elevated Refuge Stationing</div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Duration: 240s</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-950/80 text-sky-300 font-mono font-bold border border-sky-800/60">HARD</span>
              </div>
            </div>

            {/* Scenario 3: Earthquake */}
            <div className="glass-panel rounded-3xl p-6 border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center mb-6 text-amber-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">Scenario 03</div>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">Office Earthquake Safety</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Magnitude 6.8 seismic event. Violent camera tremors and falling acoustic tiles require instant Drop, Cover, and Hold actions beneath workstations before proceeding to clear exits.
                </p>
                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Real-time Camera Shake Physics</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Desk Crouch / Cover Mechanics</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Post-tremor Evacuation Drills</div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Duration: 210s</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 font-mono font-bold border border-amber-800/60">HARD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Engine & Architecture Section */}
      <section id="technology" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-orange-400 mb-2">Engine Architecture</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Zero Heavy Engine Dependencies. <br />
              Runs Smoothly on Standard Laptops.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Unlike Unreal or Unity which demand gigabytes of disk space and discrete graphics cards, DisasterSim AI renders a complete procedural 3D office building using Three.js and React Three Fiber.
            </p>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl glass-panel border-slate-800 flex items-start gap-4">
                <Cpu className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Procedural Mesh Generation</div>
                  <div className="text-slate-400 mt-0.5">Procedural walls, doors, stairs, and furniture ensure instant load times without waiting for 100MB model files.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border-slate-800 flex items-start gap-4">
                <Layers className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">AssetManager Fallback Pipeline</div>
                  <div className="text-slate-400 mt-0.5">Seamlessly loads GLTF/GLB from /public/models/ if present, while gracefully falling back to procedural Three.js geometry without crashing.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border-slate-800 flex items-start gap-4">
                <Glasses className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Unified WebXR InputManager</div>
                  <div className="text-slate-400 mt-0.5">Identical simulation engine powers both Desktop WASD/mouse locomotion and WebXR 6DoF spatial VR controllers.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Card */}
          <div className="glass-panel p-8 rounded-3xl border-slate-700/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span className="font-mono text-xs font-bold text-slate-200">OFFICE_PROCEDURAL_MAP.3D</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">60 FPS OK</span>
            </div>

            <div className="py-8 space-y-4 font-mono text-xs text-slate-400">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60">
                <span>Building Geometry:</span>
                <span className="text-slate-200">30m x 26m Procedural Mesh</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60">
                <span>Active Egress Points:</span>
                <span className="text-emerald-400">Illuminated Emergency Exit #1</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60">
                <span>Suppression Equipment:</span>
                <span className="text-orange-400">CO2 Wall Canister &amp; Pull Station</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900/60">
                <span>Exterior Safe Zone:</span>
                <span className="text-sky-400">Designated Assembly Perimeter (X=23)</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Memory Footprint: &lt; 45 MB</span>
              <span>GPU Requirement: Integrated Graphics</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assessment Section */}
      <section id="ai-assessment" className="py-20 px-6 border-t border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-mono text-indigo-300 mb-4">
            <Bot className="w-4 h-4" />
            <span>Google Gemini Assessment Core</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white max-w-2xl mx-auto mb-4">
            Auditing Real Actions, Not Assumptions
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto mb-12">
            DisasterSim AI feeds chronologically timestamped events directly into the AI evaluator. No simulated hallucinations. Fallback deterministic scoring ensures 100% operational uptime even when offline.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            <div className="glass-panel p-6 rounded-2xl border-slate-800">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Step 01</div>
              <h4 className="text-base font-bold text-white mb-2">Real-time Telemetry</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Logs spatial coordinates, time-to-alarm, route choices, and hazard distance into the EventRecorder.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-slate-800">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Step 02</div>
              <h4 className="text-base font-bold text-white mb-2">Multi-tier Scoring</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Applies standard weights: Safety Behavior (40), Decisions (25), Response Time (20), and Tool Interactions (15).
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-slate-800">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Step 03</div>
              <h4 className="text-base font-bold text-white mb-2">Structured Evaluation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Returns risk level categorization (Low to Critical), strengths, tactical mistakes, and personalized coaching advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-slate-300">DisasterSim AI</span>
            <span>&mdash; Immersive 3D Disaster Simulation &amp; Employee Safety Training</span>
          </div>
          <div>
            Built with React &bull; Three.js &bull; R3F &bull; WebXR &bull; Spring Boot &bull; PostgreSQL
          </div>
        </div>
      </footer>
    </div>
  );
};
