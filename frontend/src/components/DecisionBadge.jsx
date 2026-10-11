import React from 'react';
import { getDecisionConfig } from '../utils/riskUtils';
import { CheckCircle, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';

export default function DecisionBadge({ decision, showIcon = true, className = '' }) {
  const config = getDecisionConfig(decision);

  const renderIcon = () => {
    if (!showIcon) return null;
    const norm = (decision || '').toUpperCase();
    if (norm === 'APPROVE') return <CheckCircle size={13} />;
    if (norm === 'VERIFY') return <AlertTriangle size={13} />;
    if (norm === 'BLOCK') return <ShieldAlert size={13} />;
    return <HelpCircle size={13} />;
  };

  return (
    <span
      className={`badge ${config.badgeClass} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      title={config.description}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
