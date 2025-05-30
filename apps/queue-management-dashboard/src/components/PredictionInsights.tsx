import { cn, formatRelativeTime, getConfidenceColor, formatPercentage } from '../utils/helpers';
import type { PredictionData } from '../types/api';

interface InsightCardProps {
  insight: PredictionData['insights'][0];
}

function InsightCard({ insight }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-emergency-500';
      case 'warning':
        return 'border-l-warning-500';
      default:
        return 'border-l-primary-500';
    }
  };

  return (
    <div className={cn(
      "bg-white/90 backdrop-blur-sm rounded-xl border-l-4 p-5 shadow-lg hover:shadow-xl transition-all duration-300",
      getInsightBorderColor(insight.type)
    )}>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <span className="text-lg">{getInsightIcon(insight.type)}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {insight.message}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Confidence:</span>
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm",
              getConfidenceColor(insight.confidence)
            )}>
              {formatPercentage(insight.confidence)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PredictionInsightsProps {
  insights: PredictionData['insights'];
  modelStatus: PredictionData['model'];
  loading?: boolean;
}

export function PredictionInsights({ insights, modelStatus, loading = false }: PredictionInsightsProps) {
  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            AI Insights & Predictions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            modelStatus.status === 'healthy' ? 'bg-emerald-500' :
            modelStatus.status === 'degraded' ? 'bg-amber-500' :
            'bg-rose-500'
          )}></div>
          <span className="text-sm text-gray-600">
            Model {modelStatus.status}
          </span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {insights.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">🤖</span>
            <p>No insights available at the moment</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))
        )}
      </div>

      {/* Model Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Model Accuracy</span>
            <span className="text-lg font-bold text-slate-900">
              {formatPercentage(modelStatus.accuracy)}
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Last Updated</span>
            <span className="text-lg font-bold text-slate-900">
              {formatRelativeTime(modelStatus.lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
