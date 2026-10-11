import React from 'react';
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
import { Line } from 'react-chartjs-2';
import { TrendingUp, Clock } from 'lucide-react';
import { formatCurrency, formatScore } from '../utils/formatters';

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

export default function TransactionTimeline({ transactions = [], loading = false }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '340px' }}>
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} style={{ color: '#38bdf8' }} />
            <span>Transaction Volume Over Time</span>
          </div>
        </div>
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', height: '180px', background: 'rgba(148, 163, 184, 0.08)', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  // Sort chronological (oldest to newest for timeline presentation)
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return (a.transaction_time || a.id || 0) - (b.transaction_time || b.id || 0);
  });

  const labels = sortedTransactions.map((tx, idx) => {
    if (tx.created_at) {
      const d = new Date(tx.created_at);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return `Tx #${tx.id || idx + 1}`;
  });

  const amounts = sortedTransactions.map((tx) => Number(tx.amount) || 0);
  const riskScores = sortedTransactions.map((tx) => Number(tx.risk_score) || 0);

  const data = {
    labels: labels.length > 0 ? labels : ['No recent data'],
    datasets: [
      {
        label: 'Transaction Volume (₹)',
        data: amounts.length > 0 ? amounts : [0],
        borderColor: '#38bdf8', // AI Sky Blue
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: amounts.length > 25 ? 0 : 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#38bdf8',
        yAxisID: 'yAmount',
      },
      {
        label: 'Composite Risk Score (0-100)',
        data: riskScores.length > 0 ? riskScores : [0],
        borderColor: '#f87171', // Red warning
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: amounts.length > 25 ? 0 : 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f87171',
        yAxisID: 'yRisk',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12, weight: '600' },
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 16, 31, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            if (context.dataset.yAxisID === 'yAmount') {
              return ` Amount: ${formatCurrency(context.raw)}`;
            }
            return ` Risk Score: ${formatScore(context.raw)} / 100`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      yAmount: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
        ticks: {
          color: '#38bdf8',
          font: { family: 'Inter', size: 11, weight: '600' },
          callback: (value) => `₹${value}`,
        },
      },
      yRisk: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#f87171',
          font: { family: 'Inter', size: 11, weight: '600' },
          callback: (value) => `${value}`,
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '8px' }}>
        <div>
          <div className="card-title">
            <TrendingUp size={18} style={{ color: '#38bdf8' }} />
            <span>Transaction Volume Over Time</span>
          </div>
          <div className="card-subtitle">
            Chronological progression of monetary transaction volume vs. evaluated composite risk score
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          <Clock size={13} />
          <span>Last {sortedTransactions.length} events</span>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

