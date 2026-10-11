import React from 'react';
import { getSurgeStatusConfig } from '../utils/riskUtils';
import { formatNumber, formatPercent, formatScore } from '../utils/formatters';
import { Zap, TrendingUp, Info } from 'lucide-react';

export default function SurgeCard({ surgeData, loading = false }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '100%', minHeight: '280px' }}>
        <div className="card-header">
          <div className="card-title">
            <Zap size={18} style={{ color: '#2563eb' }} />
            <span>Surge Velocity Intelligence</span>
          </div>
        </div>
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px' }} />
          <div style={{ height: '60px', background: '#f1f5f9', borderRadius: '8px' }} />
          <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  const baseline = surgeData?.baseline_volume ?? surgeData?.baseline_activity ?? 50.0;
  const current = surgeData?.recent_volume ?? surgeData?.current_activity ?? 0;
  const percentage = surgeData?.activity_change_pct ?? surgeData?.surge_percentage ?? 0.0;
  const surgeScore = surgeData?.surge_score ?? 0.0;
  const status = surgeData?.surge_status || 'Normal Volume';

  const config = getSurgeStatusConfig(status);
  const isSurgePositive = percentage > 0;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">
              <Zap size={18} style={{ color: '#2563eb' }} />
              <span>Surge Velocity Intelligence</span>
            </div>
            <div className="card-subtitle">
              Rolling baseline comparison & burst velocity classification
            </div>
          </div>
          <span
            className="badge"
            style={{
              backgroundColor: config.bg,
              color: config.color,
              borderColor: config.border,
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Core Metric Dials Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Current Activity */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Velocity
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {formatNumber(current)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>tx/win</span>
            </div>
          </div>

          {/* Baseline Activity */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Rolling Baseline
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
              {formatScore(baseline)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>tx/hr</span>
            </div>
          </div>

          {/* Volume Delta */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Activity Shift
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: isSurgePositive ? (status === 'Suspicious Surge' ? '#dc2626' : '#2563eb') : '#475569',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <TrendingUp size={15} />
              <span>{isSurgePositive ? '+' : ''}{formatPercent(percentage)}</span>
            </div>
          </div>

          {/* Surge Score Index */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Surge Score
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {formatScore(surgeScore)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Progress Bar of Surge Intensity */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Volume Surge Intensity</span>
            <span style={{ color: config.color, fontWeight: 700 }}>{formatScore(surgeScore)}%</span>
          </div>
          <div
            style={{
              height: '8px',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, surgeScore))}%`,
                background: config.color,
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Critical Intelligence Callout Note */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #dbeafe',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.45 }}>
          <strong>Adaptive Principle:</strong> High transaction volume does <em>not</em> imply fraud. SurgeShield differentiates legitimate surges from malicious attacks via multi-indicator PCA & temporal scoring.
        </div>
      </div>
    </div>
  );
}
