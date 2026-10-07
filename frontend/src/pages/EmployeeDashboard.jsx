import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Waves,
  Activity,
  Award,
  Clock,
  Shield,
  CheckCircle,
  Play,
  RotateCcw,
  LogOut,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { scenarioService, trainingService } from '../services/api';
import { TrainingReportModal } from '../components/TrainingReportModal';

export const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTrainings: 0,
    completedTrainings: 0,
    averageScore: 0,
    bestScore: 0,
    averageResponseTime: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReportSession, setSelectedReportSession] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scenariosData, historyData, statsData] = await Promise.all([
        scenarioService.getScenarios(),
        user?.id ? trainingService.getEmployeeHistory(user.id) : [],
        user?.id ? trainingService.getEmployeePerformance(user.id) : {},
      ]);

      setScenarios(scenariosData);
      setHistory(historyData);
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScenarioIcon = (type) => {
    switch (type) {
      case 'FIRE':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'FLOOD':
        return <Waves className="w-6 h-6 text-sky-400" />;
      case 'EARTHQUAKE':
        return <Activity className="w-6 h-6 text-amber-500" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  const getBestScoreForScenario = (scenarioId) => {
    const matching = history.filter((h) => h.scenario?.id === scenarioId && h.completionStatus === 'COMPLETED');
    if (matching.length === 0) return null;
    return Math.max(...matching.map((m) => m.score || 0));
  };

  const getAttemptsForScenario = (scenarioId) => {
    return history.filter((h) => h.scenario?.id === scenarioId).length;
  };

  const handleStartTraining = (scenarioId) => {
    navigate(`/simulation/${scenarioId}`);
  };

  if (selectedReportSession) {
    return (
      <TrainingReportModal
        session={selectedReportSession}
        onRetake={() => {
          const scId = selectedReportSession.scenario?.id;
          setSelectedReportSession(null);
          navigate(`/simulation/${scId}`);
        }}
        onBackToDashboard={() => setSelectedReportSession(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">DisasterSim</span>
              <span className="text-orange-500 font-bold ml-1 text-xs uppercase font-mono">AI</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 border-l border-slate-700 pl-2">
                Employee Training Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-xs text-emerald-400 font-bold">
                {user?.name?.charAt(0) || 'E'}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-200">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{user?.role}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
          <div>
            <div className="text-xs uppercase font-bold text-orange-400 tracking-wider mb-1">
              Active Drills Dashboard
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Complete the mandated 3D disaster drills to maintain certified safety compliance.
              Ensure you follow standard evacuation egress routes.
            </p>
          </div>

          <button
            onClick={() => handleStartTraining(scenarios[0]?.id || 1)}
            className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition shadow-lg shadow-orange-600/20 flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4" />
            <span>Start Mandated Fire Drill</span>
          </button>
        </div>

        {/* 5 Enterprise Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Total Drills</div>
            <div className="text-2xl font-black font-mono text-white">{stats.totalTrainings}</div>
            <div className="text-[10px] text-slate-400 mt-1">Initiated attempts</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Completed</div>
            <div className="text-2xl font-black font-mono text-emerald-400">{stats.completedTrainings}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Safe-zone reached</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Average Score</div>
            <div className="text-2xl font-black font-mono text-amber-400">{stats.averageScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
            <div className="text-[10px] text-slate-400 mt-1">4-tier weighted</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Best Score</div>
            <div className="text-2xl font-black font-mono text-indigo-400">{stats.bestScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Top performance</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Avg Response</div>
            <div className="text-2xl font-black font-mono text-sky-400">{stats.averageResponseTime}s</div>
            <div className="text-[10px] text-slate-400 mt-1">Evacuation speed</div>
          </div>
        </div>

        {/* 3D Disaster Scenario Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Disaster Training Scenarios</h2>
              <p className="text-xs text-slate-400">Select a scenario to launch the interactive 3D simulation</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{scenarios.length} Scenarios Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((sc) => {
              const bestScore = getBestScoreForScenario(sc.id);
              const attempts = getAttemptsForScenario(sc.id);

              return (
                <div
                  key={sc.id}
                  className="glass-panel rounded-3xl p-6 border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center">
                        {getScenarioIcon(sc.type)}
                      </div>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        sc.difficulty === 'EASY'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : sc.difficulty === 'HARD'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-orange-950 text-orange-400 border-orange-800'
                      }`}>
                        {sc.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{sc.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">
                      {sc.description}
                    </p>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-6">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Best Score</div>
                        <div className="font-bold text-slate-200 mt-0.5">
                          {bestScore !== null ? `${bestScore.toFixed(1)} / 100` : 'Not Attempted'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Attempts</div>
                        <div className="font-bold text-slate-200 mt-0.5">{attempts} Runs</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTraining(sc.id)}
                    className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>Launch 3D Simulation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training History Table */}
        <div className="glass-panel rounded-3xl p-6 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Training History</h2>
              <p className="text-xs text-slate-400">Audit trail of completed drills and generated AI reports</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No training sessions recorded yet. Launch your first drill above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Scenario</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Response Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 pl-2 font-semibold text-slate-200 flex items-center gap-2">
                        {getScenarioIcon(sess.scenario?.type)}
                        <span>{sess.scenario?.name}</span>
                      </td>
                      <td className="py-3.5 font-mono font-bold">
                        <span className={sess.score >= 80 ? 'text-emerald-400' : sess.score >= 60 ? 'text-amber-400' : 'text-red-400'}>
                          {sess.score?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-slate-500 font-normal"> / 100</span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        {sess.responseTime?.toFixed(1) || 0}s
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          sess.completionStatus === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {sess.completionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono">
                        {sess.startTime ? new Date(sess.startTime).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedReportSession(sess)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
