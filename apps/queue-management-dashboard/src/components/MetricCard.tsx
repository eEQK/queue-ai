import { cn, formatNumber, formatDuration, getStatusColor } from '../utils/helpers';
import type { QueueData } from '../types/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'normal' | 'busy' | 'critical';
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  loading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  status, 
  icon, 
  trend, 
  loading = false 
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="metric-card">
        <div className="animate-pulse">
          <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const getCardClassName = () => {
    const base = "metric-card group";
    switch (status) {
      case 'critical':
        return `${base} metric-card-critical hover:shadow-rose-200/50`;
      case 'busy':
        return `${base} metric-card-warning hover:shadow-amber-200/50`;
      case 'normal':
        return `${base} metric-card-success hover:shadow-emerald-200/50`;
      default:
        return base;
    }
  };

  return (
    <div className={getCardClassName()}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                <div className="text-xl icon-glow">{icon}</div>
              </div>
            )}
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</h3>
          </div>
          
          <div className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors duration-300">
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
          
          {subtitle && (
            <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm",
            trend.direction === 'up' ? 'text-rose-700 bg-rose-100/80' : 
            trend.direction === 'down' ? 'text-emerald-700 bg-emerald-100/80' : 
            'text-slate-600 bg-slate-100/80'
          )}>
            <span className="text-base">
              {trend.direction === 'up' ? '↗' : 
               trend.direction === 'down' ? '↘' : '→'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {status && (
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <span className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border",
            status === 'normal' ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50' :
            status === 'busy' ? 'bg-amber-100/80 text-amber-800 border-amber-200/50' :
            'bg-rose-100/80 text-rose-800 border-rose-200/50'
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full mr-2",
              status === 'normal' ? 'bg-emerald-500' :
              status === 'busy' ? 'bg-amber-500' :
              'bg-rose-500'
            )}></div>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}

interface QueueMetricsProps {
  data: QueueData | null;
  loading?: boolean;
}

export function QueueMetrics({ data, loading = false }: QueueMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <MetricCard
        title="Current Queue Length"
        value={data?.queueLength || 0}
        subtitle="patients waiting"
        status={data?.status}
        icon={<span className="text-blue-600">👥</span>}
        loading={loading}
        trend={data?.queueLength ? {
          value: Math.floor(Math.random() * 20), // Placeholder trend
          direction: data.queueLength > 10 ? 'up' : data.queueLength > 5 ? 'stable' : 'down'
        } : undefined}
      />
      
      <MetricCard
        title="Average Wait Time"
        value={data ? formatDuration(data.averageWaitTime) : '0m'}
        subtitle="current estimate"
        icon={<span className="text-amber-600">⏱️</span>}
        loading={loading}
        trend={data?.averageWaitTime ? {
          value: Math.floor(Math.random() * 15),
          direction: data.averageWaitTime > 30 ? 'up' : data.averageWaitTime > 15 ? 'stable' : 'down'
        } : undefined}
      />
      
      <MetricCard
        title="System Status"
        value={data?.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Unknown'}
        subtitle="overall performance"
        status={data?.status}
        icon={<span className="text-emerald-600">🏥</span>}
        loading={loading}
      />
    </div>
  );
}
