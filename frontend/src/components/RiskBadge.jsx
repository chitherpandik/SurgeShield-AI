import React from 'react';
import { getRiskLevelConfig } from '../utils/riskUtils';
import { Shield, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level, showIcon = true, className = '' }) {
  const config = getRiskLevelConfig(level);
  
  const renderIcon = () => {
    if (!showIcon) return null;
    const norm = (level || '').toUpperCase();
    if (norm === 'LOW') return <Shield size={12} />;
    if (norm === 'MEDIUM' || norm === 'MED') return <AlertTriangle size={12} />;
    return <ShieldAlert size={12} />;
  };

  return (
    <span
      className={`badge ${config.badgeClass} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      title={`Risk Tier: ${config.label} (${config.scoreRange})`}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
