import React from 'react';
import { getRiskLevelConfig, getScoreColor } from '../utils/riskUtils';
import RiskBadge from './RiskBadge';

export default function RiskGauge({ score = 0, level = 'LOW', size = 200 }) {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  const strokeColor = getScoreColor(normalizedScore);
  const config = getRiskLevelConfig(level);

  // SVG parameters for 180-degree semi-circle gauge
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        position: 'relative',
      }}
    >
      <div style={{ width: size, height: size * 0.65, position: 'relative' }}>
        <svg
          viewBox="0 0 200 120"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Color Segments Indicator Reference Dots */}
          <circle cx="20" cy="100" r="3" fill="#16a34a" />
          <circle cx="100" cy="20" r="3" fill="#d97706" />
          <circle cx="180" cy="100" r="3" fill="#dc2626" />

          {/* Active Gauge Path */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1,
              fontFamily: 'var(--font-display)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {normalizedScore.toFixed(1)}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px', letterSpacing: '0.04em' }}>
            Threat Index / 100
          </div>
        </div>
      </div>

      {/* Risk Badge and Threshold Range */}
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <RiskBadge level={level} />
        <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>
          Scale Range: {config.scoreRange}
        </span>
      </div>
    </div>
  );
}
