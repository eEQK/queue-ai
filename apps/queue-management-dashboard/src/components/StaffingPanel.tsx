import { cn, formatPercentage } from '../utils/helpers';
import type { StaffingRecommendation, AdvancedMetrics } from '../types/api';

interface StaffingPanelProps {
  staffing: StaffingRecommendation | null;
  capacity: AdvancedMetrics['capacity'] | null;
  loading?: boolean;
}

export function StaffingPanel({ staffing, capacity, loading = false }: StaffingPanelProps) {
  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStaffingLevelColor = (level: string) => {
    switch (level) {
      case 'optimal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'understaffed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'overstaffed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 0.9) {
      return 'bg-rose-500';
    } else if (utilization >= 0.7) {
      return 'bg-amber-500';
    } else {
      return 'bg-emerald-500';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">👨‍⚕️</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Staffing & Capacity
        </h2>
      </div>

      {/* Staffing Cards Grid */}
      {staffing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-700">
              Staffing Recommendations
            </h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              getStaffingLevelColor(staffing.staffingLevel)
            )}>
              {staffing.staffingLevel.charAt(0).toUpperCase() + staffing.staffingLevel.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {staffing.currentStaff}
              </div>
              <div className="text-sm text-slate-600 font-medium">Current Staff</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {staffing.recommendedStaff}
              </div>
              <div className="text-sm text-slate-600 font-medium">Recommended</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50">
            <p className="text-sm text-slate-700 mb-2">
              {staffing.reasoning}
            </p>
            <div className="text-xs text-slate-500">
              Confidence: {formatPercentage(staffing.confidence)}
            </div>
          </div>
        </div>
      )}

      {/* Capacity Information Cards */}
      {capacity && (
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-4">
            Capacity Utilization
          </h3>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600">Current Utilization</span>
              <span className="font-bold text-slate-900">
                {formatPercentage(capacity.utilization)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className={cn(
                  "h-3 rounded-full transition-all duration-500",
                  getCapacityColor(capacity.utilization)
                )}
                style={{ width: `${capacity.utilization * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {capacity.current}
              </div>
              <div className="text-sm text-slate-600 font-medium">Current Load</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {capacity.maximum}
              </div>
              <div className="text-sm text-slate-600 font-medium">Max Capacity</div>
            </div>
          </div>

          {capacity.projectedPeak && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <span className="font-bold text-amber-800">Projected Peak</span>
              </div>
              <div className="text-sm text-amber-700">
                Expected <span className="font-bold">{capacity.projectedPeak.expected}</span> patients at{' '}
                <span className="font-bold">
                  {new Date(capacity.projectedPeak.time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
