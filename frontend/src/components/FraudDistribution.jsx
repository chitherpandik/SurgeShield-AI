import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatNumber, formatPercent } from '../utils/formatters';
import { PieChart, ShieldCheck, ShieldAlert } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FraudDistribution({ dashboardData, loading = false }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '100%', minHeight: '280px' }}>
        <div className="card-header">
          <div className="card-title">
            <PieChart size={18} style={{ color: '#2563eb' }} />
            <span>Transaction Classification Ratio</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: '#f1f5f9' }} />
        </div>
      </div>
    );
  }

  const legitCount = Number(dashboardData?.legitimate_count) || 0;
  const fraudCount = Number(dashboardData?.fraud_count) || 0;
  const total = legitCount + fraudCount;
  const fraudPct = total > 0 ? (fraudCount / total) * 100 : 0;
  const legitPct = total > 0 ? (legitCount / total) * 100 : 0;

  const data = {
    labels: ['Legitimate (Approved)', 'Fraudulent (Blocked)'],
    datasets: [
      {
        data: total > 0 ? [legitCount, fraudCount] : [1, 0],
        backgroundColor: [
          '#16a34a', // Emerald Green
          '#dc2626', // Crimson Red
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: {
      legend: {
        display: false,
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
          label: function (context) {
            const count = context.raw;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatNumber(count)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="card-header">
          <div>
            <div className="card-title">
              <PieChart size={18} style={{ color: '#2563eb' }} />
              <span>Transaction Classification Ratio</span>
            </div>
            <div className="card-subtitle">
              Portfolio proportion of safe vs. blocked fraudulent transactions
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Total: {formatNumber(total)}
          </span>
        </div>

        {/* Donut Chart Container with Center Callout */}
        <div style={{ position: 'relative', height: '180px', width: '100%', margin: '4px 0' }}>
          <Doughnut data={data} options={options} />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {formatPercent(fraudPct)}
            </div>
            <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
              Fraud Rate
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Legitimate</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
              {formatNumber(legitCount)}{' '}
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
                ({formatPercent(legitPct)})
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={16} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Fraud / Blocked</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>
              {formatNumber(fraudCount)}{' '}
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
                ({formatPercent(fraudPct)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
