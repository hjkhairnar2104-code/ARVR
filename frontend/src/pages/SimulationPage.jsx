import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SimulationViewport } from '../scenes/SimulationViewport';
import { TrainingReportModal } from '../components/TrainingReportModal';
import { scenarioService, trainingService } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

export const SimulationPage = () => {
  const { scenarioId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState(null);
  const [session, setSession] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initSimulation();
  }, [scenarioId]);

  const initSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setCompletedSession(null);

      // 1. Fetch scenario details
      const scData = await scenarioService.getScenarioById(scenarioId);
      setScenario(scData);

      // 2. Start new session on backend
      const sessData = await trainingService.startTraining(scenarioId);
      setSession(sessData);
    } catch (err) {
      console.error('Failed to initiate simulation:', err);
      setError('Could not connect to simulation engine. Please verify backend server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center mb-4 animate-pulse">
          <Shield className="w-6 h-6 text-orange-500" />
        </div>
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Loading 3D Office Environment...</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">Calibrating procedural geometry &amp; WebXR input pipeline</p>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full border-slate-800">
          <h2 className="text-xl font-bold text-red-400 mb-2">Simulation Initialization Failed</h2>
          <p className="text-xs text-slate-300 mb-6">{error || 'Scenario not found'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={initSimulation}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If simulation concluded, display the Post-Training Report Modal
  if (completedSession) {
    return (
      <TrainingReportModal
        session={completedSession}
        onRetake={() => {
          initSimulation();
        }}
        onBackToDashboard={() => {
          navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard');
        }}
      />
    );
  }

  // Active 3D Simulation
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950">
      <SimulationViewport
        scenario={scenario}
        session={session}
        user={user}
        onComplete={(result) => {
          setCompletedSession(result);
        }}
        onExit={() => {
          navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard');
        }}
      />
    </div>
  );
};
