import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  }
  
  return format(date, 'MMM dd, HH:mm');
}

export function formatRelativeTime(timestamp: string | Date): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function getStatusColor(status: 'normal' | 'busy' | 'critical'): string {
  switch (status) {
    case 'normal':
      return 'text-success-600 bg-success-50 border-success-200';
    case 'busy':
      return 'text-warning-600 bg-warning-50 border-warning-200';
    case 'critical':
      return 'text-emergency-600 bg-emergency-50 border-emergency-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) {
    return 'text-success-600';
  } else if (confidence >= 0.6) {
    return 'text-warning-600';
  } else {
    return 'text-emergency-600';
  }
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

export function generateTimeLabels(hours: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    labels.push(format(time, 'HH:mm'));
  }
  
  return labels;
}

export function generateForecastLabels(horizon: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = 1; i <= horizon; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    labels.push(format(time, 'HH:mm'));
  }
  
  return labels;
}
