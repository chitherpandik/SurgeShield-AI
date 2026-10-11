import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RiskScoreDistribution({ riskSummaryData, loading = false }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '320px' }}>
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={18} style={{ color: '#2563eb' }} />
            <span>Risk Score & Decision Funnel</span>
          </div>
        </div>
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '85%', height: '160px', background: '#f1f5f9', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  const low = Number(riskSummaryData?.low_risk) || 0;
  const med = Number(riskSummaryData?.medium_risk) || 0;
  const high = Number(riskSummaryData?.high_risk) || 0;

  const approved = Number(riskSummaryData?.approved) || 0;
  const verified = Number(riskSummaryData?.verified) || 0;
  const blocked = Number(riskSummaryData?.blocked) || 0;

  const data = {
    labels: ['Low / Approve', 'Medium / Verify', 'High / Block'],
    datasets: [
      {
        label: 'Risk Tier Count',
        data: [low, med, high],
        backgroundColor: [
          '#16a34a',
          '#d97706',
          '#dc2626',
        ],
        borderRadius: 4,
      },
      {
        label: 'Action Enforced Count',
        data: [approved, verified, blocked],
        backgroundColor: [
          '#60a5fa',
          '#fbbf24',
          '#f87171',
        ],
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 12, weight: '600' },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatNumber(context.raw)} transactions`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#0f172a',
          font: { family: 'Inter', size: 12, weight: '600' },
        },
      },
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '8px' }}>
        <div>
          <div className="card-title">
            <BarChart3 size={18} style={{ color: '#2563eb' }} />
            <span>Risk Score & Decision Funnel</span>
          </div>
          <div className="card-subtitle">
            Portfolio distribution across risk thresholds and automated actions
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
