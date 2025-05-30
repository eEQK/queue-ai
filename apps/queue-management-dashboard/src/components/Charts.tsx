import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { QueueData, PredictionData } from '../types/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface QueueChartProps {
  historicalData: QueueData[];
  predictions?: PredictionData;
  loading?: boolean;
}

export function QueueChart({ historicalData, predictions, loading = false }: QueueChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
          </div>
          <div className="h-80 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Generate labels based on actual historical data timestamps
  const historicalLabels = historicalData.map(d => {
    const date = new Date(d.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  });
  
  // Generate forecast labels starting from the last historical timestamp
  const forecastLabels = predictions ? (() => {
    const lastHistoricalTime = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].timestamp) : new Date();
    const labels: string[] = [];
    for (let i = 0; i < predictions.predictions.queueLength.length; i++) {
      const time = new Date(lastHistoricalTime.getTime() + (i + 1) * 60 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
    return labels;
  })() : [];
  
  const data = {
    labels: [...historicalLabels, ...forecastLabels],
    datasets: [
      {
        label: 'Historical Queue Length',
        data: [
          ...historicalData.map(d => d.queueLength),
          ...Array(forecastLabels.length).fill(null)
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      ...(predictions ? [{
        label: 'Predicted Queue Length',
        data: [
          ...Array(historicalLabels.length).fill(null),
          ...predictions.predictions.queueLength
        ],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        borderDash: [8, 4],
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: false,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} patients`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Patients',
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">📊</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Queue Length Analysis</h2>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

interface WaitTimeChartProps {
  historicalData: QueueData[];
  predictions?: PredictionData;
  loading?: boolean;
}

export function WaitTimeChart({ historicalData, predictions, loading = false }: WaitTimeChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
          </div>
          <div className="h-80 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Generate labels based on actual historical data timestamps
  const historicalLabels = historicalData.map(d => {
    const date = new Date(d.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  });
  
  // Generate forecast labels starting from the last historical timestamp
  const forecastLabels = predictions ? (() => {
    const lastHistoricalTime = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].timestamp) : new Date();
    const labels: string[] = [];
    for (let i = 0; i < predictions.predictions.waitTime.length; i++) {
      const time = new Date(lastHistoricalTime.getTime() + (i + 1) * 60 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
    return labels;
  })() : [];
  
  const data = {
    labels: [...historicalLabels, ...forecastLabels],
    datasets: [
      {
        label: 'Historical Wait Time',
        data: [
          ...historicalData.map(d => d.averageWaitTime),
          ...Array(forecastLabels.length).fill(null)
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      ...(predictions ? [{
        label: 'Predicted Wait Time',
        data: [
          ...Array(historicalLabels.length).fill(null),
          ...predictions.predictions.waitTime
        ],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        borderDash: [8, 4],
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: false,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            const minutes = Math.round(context.parsed.y);
            return `${context.dataset.label}: ${minutes} minutes`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Wait Time (minutes)',
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">⏱️</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Wait Time Analysis</h2>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
