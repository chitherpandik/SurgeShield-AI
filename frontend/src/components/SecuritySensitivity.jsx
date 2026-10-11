import React, { useState } from 'react';
import { Sliders, Shield, UserCheck, Info } from 'lucide-react';

export default function SecuritySensitivity() {
  const [sensitivityValue, setSensitivityValue] = useState(50);

  const getProfileDescription = () => {
    if (sensitivityValue < 35) {
      return {
        label: 'Frictionless Customer Experience',
        desc: 'Prioritizes immediate checkout approvals with minimal 2FA verification interruptions.',
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
      };
    }
    if (sensitivityValue > 65) {
      return {
        label: 'Maximum Security Lockdown',
        desc: 'Enforces aggressive multi-factor verification and conservative fraud thresholds.',
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
      };
    }
    return {
      label: 'Balanced Adaptive Intelligence (Default)',
      desc: 'Optimized weights: 50% XGBoost ML Model, 15% Surge Velocity, 15% Temporal, 20% PCA Feature Pattern.',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    };
  };

  const profile = getProfileDescription();

  return (
    <div className="glass-card">
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <div>
          <div className="card-title">
            <Sliders size={18} style={{ color: '#2563eb' }} />
            <span>Security Sensitivity Calibration</span>
          </div>
          <div className="card-subtitle">
            Adaptive policy balancing frictionless customer journey vs. rigorous fraud mitigation
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            textTransform: 'uppercase',
          }}
        >
          SOC Control
        </span>
      </div>

      {/* Interactive Range Slider */}
      <div style={{ padding: '8px 0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
          <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserCheck size={14} /> Low Friction (0)
          </span>
          <span style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={14} /> Maximum Strict (100)
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sensitivityValue}
          onChange={(e) => setSensitivityValue(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #16a34a 0%, #2563eb 50%, #dc2626 100%)',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          <span>Customer First</span>
          <span style={{ color: profile.color, fontWeight: 700 }}>Active Profile: {profile.label}</span>
          <span>Defense First</span>
        </div>
      </div>

      {/* Informative Note */}
      <div
        style={{
          marginTop: '12px',
          background: profile.bg,
          border: `1px solid ${profile.border}`,
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        <Info size={14} style={{ color: profile.color, flexShrink: 0 }} />
        <span style={{ color: '#1e293b', lineHeight: 1.4 }}>
          {profile.desc}{' '}
          <em style={{ color: '#64748b' }}>(Managed securely in backend settings).</em>
        </span>
      </div>
    </div>
  );
}
