import { useState, useEffect } from 'react';
import { QueueChart, WaitTimeChart } from './Charts';
import { PredictionInsights } from './PredictionInsights';
import { StaffingPanel } from './StaffingPanel';
import { ScenarioAnalysisPanel } from './ScenarioAnalysis';
import { ApiService, withErrorHandling } from '../services/api';
import type { QueueData, PredictionData, StaffingRecommendation, AdvancedMetrics, ScenarioAnalysis } from '../types/api';
import { formatRelativeTime } from '../utils/helpers';

export function Dashboard() {
  // State
  const [currentQueue, setCurrentQueue] = useState<QueueData | null>(null);
  const [queueHistory, setQueueHistory] = useState<QueueData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [staffing, setStaffing] = useState<StaffingRecommendation | null>(null);
  const [capacity, setCapacity] = useState<AdvancedMetrics['capacity'] | null>(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    queue: true,
    history: true,
    predictions: true,
    staffing: true,
    capacity: true,
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Data fetching functions
  const fetchCurrentQueue = async () => {
    const data = await withErrorHandling(() => ApiService.getCurrentQueueStatus());
    if (data) {
      setCurrentQueue(data);
      setLastUpdated(new Date());
    }
    setLoading(prev => ({ ...prev, queue: false }));
  };

  const fetchQueueHistory = async () => {
    const data = await withErrorHandling(() => ApiService.getQueueHistory(24));
    if (data) {
      setQueueHistory(data);
    }
    setLoading(prev => ({ ...prev, history: false }));
  };

  const fetchPredictions = async () => {
    const data = await withErrorHandling(() => ApiService.getPredictions(6));
    if (data) {
      setPredictions(data);
    }
    setLoading(prev => ({ ...prev, predictions: false }));
  };

  const fetchStaffing = async () => {
    const data = await withErrorHandling(() => ApiService.getStaffingRecommendations());
    if (data) {
      setStaffing(data);
    }
    setLoading(prev => ({ ...prev, staffing: false }));
  };

  const fetchCapacity = async () => {
    const data = await withErrorHandling(() => ApiService.getCapacityForecast());
    if (data) {
      setCapacity(data);
    }
    setLoading(prev => ({ ...prev, capacity: false }));
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchCurrentQueue(),
      fetchQueueHistory(),
      fetchPredictions(),
      fetchStaffing(),
      fetchCapacity(),
    ]);
  };

  const handleRefresh = () => {
    setLoading({
      queue: true,
      history: true,
      predictions: true,
      staffing: true,
      capacity: true,
    });
    fetchAllData();
  };

  // Effects
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCurrentQueue();
      fetchPredictions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/30 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🏥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Emergency Room Queue Management
                </h1>
                <p className="text-slate-600 mt-1 font-medium">
                  Real-time monitoring and AI-powered predictions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <span className="font-medium">Last updated:</span> {formatRelativeTime(lastUpdated)}
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm border ${
                  autoRefresh 
                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 shadow-lg' 
                    : 'bg-slate-100/80 text-slate-600 border-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </div>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isAnyLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnyLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    Refresh
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Metrics Cards - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Queue Length Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Current Queue Length</h3>
                  <div className="text-3xl font-bold text-slate-900">
                    {loading.queue ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-16"></div>
                    ) : (
                      currentQueue?.queueLength || 0
                    )}
                  </div>
                  <p className="text-sm text-slate-500">patients waiting</p>
                </div>
              </div>
              {currentQueue?.status && (
                <div className="pt-4 border-t border-slate-200">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    currentQueue.status === 'normal' ? 'bg-emerald-100 text-emerald-800' :
                    currentQueue.status === 'busy' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {currentQueue.status.charAt(0).toUpperCase() + currentQueue.status.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Average Wait Time Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⏱️</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Average Wait Time</h3>
                  <div className="text-3xl font-bold text-slate-900">
                    {loading.queue ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-20"></div>
                    ) : (
                      `${currentQueue?.averageWaitTime || 0}m`
                    )}
                  </div>
                  <p className="text-sm text-slate-500">current estimate</p>
                </div>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🏥</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">System Status</h3>
                  <div className="text-3xl font-bold text-slate-900">
                    {loading.queue ? (
                      <div className="h-8 bg-slate-200 rounded animate-pulse w-24"></div>
                    ) : (
                      currentQueue?.status ? currentQueue.status.charAt(0).toUpperCase() + currentQueue.status.slice(1) : 'Unknown'
                    )}
                  </div>
                  <p className="text-sm text-slate-500">overall performance</p>
                </div>
              </div>
              {currentQueue?.status && (
                <div className="pt-4 border-t border-slate-200">
                  <div className={`w-3 h-3 rounded-full inline-block mr-2 ${
                    currentQueue.status === 'normal' ? 'bg-emerald-500' :
                    currentQueue.status === 'busy' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}></div>
                  <span className="text-sm text-slate-600">System Operational</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Charts & Insights */}
            <div className="lg:col-span-8 space-y-8">
              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                  <QueueChart 
                    historicalData={queueHistory} 
                    predictions={predictions || undefined}
                    loading={loading.history || loading.predictions}
                  />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                  <WaitTimeChart 
                    historicalData={queueHistory} 
                    predictions={predictions || undefined}
                    loading={loading.history || loading.predictions}
                  />
                </div>
              </div>

              {/* AI Insights - Card Layout */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <PredictionInsights 
                  insights={predictions?.insights || []}
                  modelStatus={predictions?.model || {
                    accuracy: 0,
                    lastUpdated: new Date().toISOString(),
                    status: 'error' as const
                  }}
                  loading={loading.predictions}
                />
              </div>

              {/* Scenario Analysis Panel */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <ScenarioAnalysisPanel 
                  onScenarioAnalyzed={setScenarioAnalysis}
                />
              </div>

              {/* Scenario Analysis Results - Conditional Display */}
              {scenarioAnalysis && (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Scenario Impact Analysis
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200/60">
                    <div className="text-center mb-6">
                      <p className="text-slate-600 mb-2">
                        Analysis results for scenario:
                      </p>
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200/50">
                        {typeof scenarioAnalysis.scenario === 'string' 
                          ? scenarioAnalysis.scenario.replace('_', ' ').toUpperCase()
                          : String(scenarioAnalysis.scenario || 'unknown').replace('_', ' ').toUpperCase()
                        }
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200/50">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {Math.round(Math.max(...scenarioAnalysis.predictions.queueLength))}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Peak Queue Length</div>
                        <div className="text-xs text-orange-600 mt-1">patients waiting</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200/50">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {Math.round(Math.max(...scenarioAnalysis.predictions.waitTime))}m
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Peak Wait Time</div>
                        <div className="text-xs text-purple-600 mt-1">minutes</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200/50">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {Math.round(scenarioAnalysis.predictions.queueLength.reduce((a, b) => a + b, 0) / scenarioAnalysis.predictions.queueLength.length)}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Avg Queue Length</div>
                        <div className="text-xs text-blue-600 mt-1">patients</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200/50">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          {Math.round(scenarioAnalysis.predictions.waitTime.reduce((a, b) => a + b, 0) / scenarioAnalysis.predictions.waitTime.length)}m
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Avg Wait Time</div>
                        <div className="text-xs text-emerald-600 mt-1">minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Controls & Status Grid */}
            <div className="lg:col-span-4 space-y-6">
              {/* Staffing Panel */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <StaffingPanel 
                  staffing={staffing}
                  capacity={capacity}
                  loading={loading.staffing || loading.capacity}
                />
              </div>

              {/* System Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* API Connection Status */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">API Status</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Connection</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        !isAnyLoading ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}></div>
                      <span className="text-xs text-slate-500">
                        {!isAnyLoading ? 'Connected' : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auto Refresh Status */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🔄</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Auto Refresh</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-xs text-slate-500">
                        {autoRefresh ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⚡</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isAnyLoading}
                    className="w-full bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/90 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isAnyLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <span>🔄</span>
                          Refresh All Data
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="w-full bg-transparent text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-white/50 hover:text-slate-900 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{autoRefresh ? '⏸️' : '▶️'}</span>
                      {autoRefresh ? 'Pause Auto-refresh' : 'Resume Auto-refresh'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-white/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isAnyLoading ? 'bg-amber-500 animate-pulse shadow-lg shadow-amber-200' : 'bg-emerald-500 shadow-lg shadow-emerald-200'
              }`}></div>
              <span className="text-sm font-medium text-slate-600">
                {isAnyLoading ? 'Updating data...' : 'Connected to API'}
              </span>
              {!isAnyLoading && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  System Operational
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Emergency Room Queue Prediction System <span className="text-blue-600">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
