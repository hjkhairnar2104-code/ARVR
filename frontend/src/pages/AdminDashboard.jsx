import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Clock,
  Shield,
  BarChart3,
  PieChart as PieIcon,
  Filter,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Flame,
  Waves,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '../store/AuthContext';
import { adminService, scenarioService } from '../services/api';
import { TrainingReportModal } from '../components/TrainingReportModal';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  const [selectedReportSession, setSelectedReportSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sessions' | 'employees' | 'scenarios'

  // Filter state for sessions table
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterScenario, setFilterScenario] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Scenario Modal State
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    type: 'FIRE',
    description: '',
    difficulty: 'MEDIUM',
    duration: 180,
    active: true,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashStats, analyticsData, sessionsData, employeesData, scenariosData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics(),
        adminService.getTrainingSessions(),
        adminService.getEmployees(),
        scenarioService.getScenarios(),
      ]);

      setStats(dashStats);
      setAnalytics(analyticsData);
      setSessions(sessionsData);
      setEmployees(employeesData);
      setScenarios(scenariosData);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesEmp = s.employeeName?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                       s.employeeEmail?.toLowerCase().includes(searchEmployee.toLowerCase());
    const matchesSc = filterScenario === 'ALL' || s.scenario?.name === filterScenario;
    const matchesSt = filterStatus === 'ALL' || s.completionStatus === filterStatus;
    return matchesEmp && matchesSc && matchesSt;
  });

  const handleSaveScenario = async (e) => {
    e.preventDefault();
    try {
      if (editingScenario) {
        await scenarioService.updateScenario(editingScenario.id, scenarioForm);
      } else {
        await scenarioService.createScenario(scenarioForm);
      }
      setShowScenarioModal(false);
      setEditingScenario(null);
      loadAllData();
    } catch (err) {
      alert('Failed to save scenario: ' + (err.response?.data?.message || err.message));
    }
  };

  const COLORS = ['#FF4500', '#0284C7', '#D97706', '#10B981', '#8B5CF6'];

  if (selectedReportSession) {
    return (
      <TrainingReportModal
        session={selectedReportSession}
        onRetake={() => setSelectedReportSession(null)}
        onBackToDashboard={() => setSelectedReportSession(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Admin Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">DisasterSim</span>
              <span className="text-indigo-400 font-bold ml-1 text-xs uppercase font-mono">ADMIN</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 border-l border-slate-700 pl-2">
                Safety Compliance Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-xs text-indigo-400 font-bold">
                A
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-200">{user?.name}</div>
                <div className="text-[10px] text-slate-400">ADMINISTRATOR</div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Overview &amp; Analytics
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'sessions'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Training Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'employees'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Registered Personnel ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'scenarios'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Manage Scenarios ({scenarios.length})
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Personnel</div>
                <div className="text-2xl font-black font-mono text-white">{stats?.totalEmployees || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Enrolled trainees</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Total Drills</div>
                <div className="text-2xl font-black font-mono text-indigo-400">{stats?.totalTrainings || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Simulations run</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Completed</div>
                <div className="text-2xl font-black font-mono text-emerald-400">{stats?.completedTrainings || 0}</div>
                <div className="text-[10px] text-emerald-400/80 mt-1">Safe evacuations</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Avg Score</div>
                <div className="text-2xl font-black font-mono text-amber-400">{stats?.averageScore || 0} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
                <div className="text-[10px] text-slate-400 mt-1">Enterprise average</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Avg Response</div>
                <div className="text-2xl font-black font-mono text-sky-400">{stats?.averageResponseTime || 0}s</div>
                <div className="text-[10px] text-slate-400 mt-1">Time to safety</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border-slate-800">
                <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Pass Rate</div>
                <div className="text-2xl font-black font-mono text-emerald-400">{stats?.passRate || 0}%</div>
                <div className="text-[10px] text-slate-400 mt-1">Compliance benchmark</div>
              </div>
            </div>

            {/* Charts Row 1: Performance Over Time & Scenario Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line/Area Chart: Performance over time */}
              <div className="glass-panel p-6 rounded-3xl border-slate-800 lg:col-span-2 shadow-xl flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Average Training Score &amp; Response Velocity Over Time</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Benchmarking employee progression across simulation sessions</p>
                </div>

                <div className="h-64 w-full">
                  {analytics?.performanceOverTime && analytics.performanceOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.performanceOverTime}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" name="Average Score" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                      No historical timeline points yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart: Scenario Distribution */}
              <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-xl flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-orange-400" />
                    <span>Scenario Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Volume of drills by disaster type</p>
                </div>

                <div className="h-56 w-full flex items-center justify-center">
                  {analytics?.scenarioDistribution && analytics.scenarioDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.scenarioDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.scenarioDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">No distribution data</div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                  {analytics?.scenarioDistribution?.map((item, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{item.name}: {item.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2: Common Mistakes & Risk Level Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Mistakes Bar Chart */}
              <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-xl">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Most Common Evacuation Lapses</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Recurring tactical errors detected across simulations</p>
                </div>

                <div className="space-y-3">
                  {analytics?.commonMistakes && analytics.commonMistakes.length > 0 ? (
                    analytics.commonMistakes.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-slate-200 font-medium">{m.mistake}</span>
                          <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                            {m.count} incident(s)
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs font-mono">
                      No common mistakes logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Category Averages Radar/Grid */}
              <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Corporate Competency Benchmarks</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Overall average scores across standard categories</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Safety Behavior</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {analytics?.categoryAverages?.safety || 35.0} <span className="text-xs text-slate-500 font-normal">/ 40</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Decision Making</div>
                    <div className="text-xl font-bold text-blue-400 mt-1">
                      {analytics?.categoryAverages?.decision || 22.0} <span className="text-xs text-slate-500 font-normal">/ 25</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Response Velocity</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">
                      {analytics?.categoryAverages?.response || 17.0} <span className="text-xs text-slate-500 font-normal">/ 20</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Equipment Interaction</div>
                    <div className="text-xl font-bold text-purple-400 mt-1">
                      {analytics?.categoryAverages?.interaction || 12.0} <span className="text-xs text-slate-500 font-normal">/ 15</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                  Compliance standard: Minimum score &gt;= 70.0 required for annual workplace certification.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TRAINING SESSIONS AUDIT TABLE ================= */}
        {activeTab === 'sessions' && (
          <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Training Sessions</h2>
                <p className="text-xs text-slate-400">Complete audit log of employee simulation runs</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No training sessions match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Employee</th>
                      <th className="pb-3">Scenario</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Response Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3.5 pl-2 font-medium text-slate-200">
                          <div>{sess.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{sess.employeeEmail}</div>
                        </td>
                        <td className="py-3.5 text-slate-300 font-medium">
                          {sess.scenario?.name}
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
                            <span>Audit Report</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: REGISTERED PERSONNEL ================= */}
        {activeTab === 'employees' && (
          <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Registered Personnel</h2>
            <p className="text-xs text-slate-400 mb-6">Directory of corporate employees with simulation permissions</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-100 truncate">{emp.name}</div>
                    <div className="text-xs text-slate-400 truncate">{emp.email}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-2">
                      Joined: {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SCENARIOS MANAGEMENT ================= */}
        {activeTab === 'scenarios' && (
          <div className="glass-panel p-6 rounded-3xl border-slate-800 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Disaster Training Scenarios</h2>
                <p className="text-xs text-slate-400">Configure parameters, durations, and active statuses</p>
              </div>

              <button
                onClick={() => {
                  setEditingScenario(null);
                  setScenarioForm({
                    name: '',
                    type: 'FIRE',
                    description: '',
                    difficulty: 'MEDIUM',
                    duration: 180,
                    active: true,
                  });
                  setShowScenarioModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Scenario</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios.map((sc) => (
                <div key={sc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-slate-400">#{sc.id} {sc.type}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sc.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{sc.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4">{sc.description}</p>
                    <div className="text-xs font-mono text-slate-400">
                      Duration: {sc.duration} seconds
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingScenario(sc);
                        setScenarioForm({
                          name: sc.name,
                          type: sc.type,
                          description: sc.description,
                          difficulty: sc.difficulty,
                          duration: sc.duration,
                          active: sc.active,
                        });
                        setShowScenarioModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Create / Edit Scenario */}
        {showScenarioModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border-slate-700 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">
                {editingScenario ? 'Edit Disaster Scenario' : 'Create New Disaster Scenario'}
              </h3>

              <form onSubmit={handleSaveScenario} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scenario Name</label>
                  <input
                    type="text"
                    required
                    value={scenarioForm.name}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Chemical Fume Incident"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Type</label>
                    <select
                      value={scenarioForm.type}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                    >
                      <option value="FIRE">FIRE</option>
                      <option value="FLOOD">FLOOD</option>
                      <option value="EARTHQUAKE">EARTHQUAKE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={scenarioForm.difficulty}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Duration (Seconds)</label>
                  <input
                    type="number"
                    required
                    min={30}
                    max={600}
                    value={scenarioForm.duration}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, duration: parseInt(e.target.value) || 180 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description &amp; Briefing</label>
                  <textarea
                    rows={3}
                    value={scenarioForm.description}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                    placeholder="Evacuation guidelines and danger points..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowScenarioModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg"
                  >
                    Save Scenario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
