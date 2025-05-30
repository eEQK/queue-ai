import { useState } from 'react';
import { cn } from '../utils/helpers';
import type { ScenarioAnalysis } from '../types/api';
import { ApiService } from '../services/api';

interface ScenarioAnalysisProps {
  onScenarioAnalyzed?: (analysis: ScenarioAnalysis) => void;
}

export function ScenarioAnalysisPanel({ onScenarioAnalyzed }: ScenarioAnalysisProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioAnalysis['scenario']>('normal');
  const [analysis, setAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    {
      id: 'normal' as const,
      name: 'Normal Operations',
      description: 'Standard operating conditions',
      icon: '🏥',
    },
    {
      id: 'high_volume' as const,
      name: 'High Volume',
      description: 'Increased patient flow (20% above normal)',
      icon: '📈',
    },
    {
      id: 'emergency' as const,
      name: 'Emergency Event',
      description: 'Mass casualty or major incident',
      icon: '🚨',
    },
    {
      id: 'staff_shortage' as const,
      name: 'Staff Shortage',
      description: 'Reduced staffing levels (30% below normal)',
      icon: '👥',
    },
  ];

  const handleAnalyzeScenario = async () => {
    setLoading(true);
    try {
      const result = await ApiService.runScenarioAnalysis(selectedScenario);
      setAnalysis(result);
      onScenarioAnalyzed?.(result);
    } catch (error) {
      console.error('Failed to analyze scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'high':
        return 'bg-emergency-100 text-emergency-800 border-emergency-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg">
          🔮
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Scenario Analysis
        </h2>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Scenario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={cn(
                "p-4 text-left border rounded-xl transition-all duration-200 bg-white/50 backdrop-blur-sm",
                selectedScenario === scenario.id
                  ? 'border-purple-300 bg-purple-50/80 ring-2 ring-purple-200 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg">
                  {scenario.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {scenario.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {scenario.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyzeScenario}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing Scenario...
            </div>
          ) : (
            'Analyze Scenario'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Impact Summary Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
                ⚠️
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Impact Assessment
              </h3>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Impact Severity</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold border",
                getSeverityColor(analysis.impact.severity)
              )}>
                {analysis.impact.severity.charAt(0).toUpperCase() + analysis.impact.severity.slice(1)}
              </span>
            </div>
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              <p className="text-sm text-gray-700">
                {analysis.impact.description}
              </p>
            </div>
          </div>

          {/* Prediction Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-lg">
                  📊
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(Math.max(...analysis.predictions.queueLength))}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Peak Queue Length</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
                  ⏱️
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(Math.max(...analysis.predictions.waitTime))}m
                  </div>
                  <div className="text-sm font-medium text-gray-600">Peak Wait Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
