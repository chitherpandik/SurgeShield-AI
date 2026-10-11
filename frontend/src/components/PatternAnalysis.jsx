import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Cpu } from 'lucide-react';
import { formatScore } from '../utils/formatters';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function PatternAnalysis({
  scores = {
    ml_score: 85,
    surge_score: 65,
    temporal_score: 75,
    pattern_score: 80,
    risk_score: 82,
  },
  title = 'Multi-Indicator Radar Profile',
  subtitle = 'Evaluated vector vs. safe baseline threshold',
}) {
  const radarData = {
    labels: [
      'ML Probability (50%)',
      'Surge Velocity (15%)',
      'Temporal Risk (15%)',
      'PCA Pattern (20%)',
      'Composite Risk',
    ],
    datasets: [
      {
        label: 'Evaluated Transaction Vector',
        data: [
          Number(scores.ml_score) || 0,
          Number(scores.surge_score) || 0,
          Number(scores.temporal_score) || 0,
          Number(scores.pattern_score) || 0,
          Number(scores.risk_score) || 0,
        ],
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#2563eb',
        pointRadius: 4,
      },
      {
        label: 'Safe Baseline Threshold (30)',
        data: [30, 30, 30, 30, 30],
        backgroundColor: 'rgba(22, 163, 74, 0.06)',
        borderColor: 'rgba(22, 163, 74, 0.7)',
        borderWidth: 1.5,
        borderDash: [3, 3],
        pointRadius: 0,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 11, weight: '500' },
          boxWidth: 10,
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
          label: (context) => ` ${context.dataset.label}: ${formatScore(context.raw)} / 100`,
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: '#e2e8f0',
        },
        grid: {
          color: '#e2e8f0',
        },
        pointLabels: {
          color: '#0f172a',
          font: { family: 'Inter', size: 11, weight: '600' },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          stepSize: 25,
          font: { size: 9 },
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '6px' }}>
        <div>
          <div className="card-title">
            <Cpu size={18} style={{ color: '#2563eb' }} />
            <span>{title}</span>
          </div>
          <div className="card-subtitle">{subtitle}</div>
        </div>
      </div>

      {/* Radar Chart Component */}
      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '220px' }}>
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Numerical Scores Summary Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>ML Prob</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{formatScore(scores.ml_score)}%</div>
        </div>
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Surge</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>{formatScore(scores.surge_score)}</div>
        </div>
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Temporal</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>{formatScore(scores.temporal_score)}</div>
        </div>
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pattern</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706' }}>{formatScore(scores.pattern_score)}</div>
        </div>
      </div>
    </div>
  );
}
