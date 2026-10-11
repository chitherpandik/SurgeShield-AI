import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  Search,
  Target,
  IndianRupee,
  CheckCircle,
} from 'lucide-react';
import { formatScore, formatPercent } from '../utils/formatters';

export default function RiskFactors({
  transaction,
  reasons = [],
  title = '🧠 Why This Transaction Was Flagged',
  subtitle = 'Explainable risk decomposition based on real-time intelligence telemetry',
  decision,
  riskScore,
  riskLevel,
  fraudProbability,
  temporalScore,
  surgeScore,
  patternScore,
  emptyMessage = 'No elevated risk factors detected. Transaction matches normal baseline behavior.',
}) {
  const tx = transaction || {};
  const effectiveDecision = (decision || tx.decision || 'APPROVE').toUpperCase();
  const isApproved = effectiveDecision === 'APPROVE';

  // Extract numerical scores from transaction or explicit props
  const fraudProb =
    fraudProbability !== undefined
      ? Number(fraudProbability)
      : tx.fraud_probability !== undefined
      ? Number(tx.fraud_probability)
      : null;

  const tempScore =
    temporalScore !== undefined
      ? Number(temporalScore)
      : tx.temporal_score !== undefined
      ? Number(tx.temporal_score)
      : null;

  const surgScore =
    surgeScore !== undefined
      ? Number(surgeScore)
      : tx.surge_score !== undefined
      ? Number(tx.surge_score)
      : null;

  const patScore =
    patternScore !== undefined
      ? Number(patternScore)
      : tx.pattern_score !== undefined
      ? Number(tx.pattern_score)
      : null;

  const rScore =
    riskScore !== undefined
      ? Number(riskScore)
      : tx.risk_score !== undefined
      ? Number(tx.risk_score)
      : null;

  const rLevel =
    riskLevel ||
    tx.risk_level ||
    (rScore !== null ? (rScore >= 70 ? 'HIGH' : rScore >= 30 ? 'MEDIUM' : 'LOW') : 'LOW');

  // Backend reason strings
  const rawReasons = reasons && reasons.length > 0 ? reasons : (tx.reasons || []);

  const temporalReason = rawReasons.find((r) =>
    /off-peak|late night|temporal|hour/i.test(r)
  );
  const surgeReason = rawReasons.find(
    (r) =>
      /surge|rolling baseline|baseline activity|baseline volume|activity is/i.test(r) &&
      !/zero-amount|high-value/i.test(r)
  );
  const amountReason = rawReasons.find((r) =>
    /amount|high-value|zero-amount|zero-dollar/i.test(r)
  );
  const hasPatternAnomaly =
    (patScore !== null && patScore >= 30) ||
    rawReasons.some((r) => /pattern|feature|contribution|V\d+/i.test(r));

  // Build high-level understandable factors without showing raw individual V1-V28 names
  const factorCards = [];

  // 1. High / Moderate ML Fraud Probability (XGBoost)
  if (fraudProb !== null) {
    if (fraudProb >= 0.50) {
      factorCards.push({
        id: 'ml_fraud_high',
        icon: <ShieldAlert size={18} style={{ color: '#ef4444' }} />,
        title: '🔴 High ML Fraud Probability',
        value: `Fraud probability: ${formatPercent(fraudProb * 100, 1)}`,
        description: 'XGBoost ML classification model evaluated elevated fraud probability.',
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.35)',
        bg: 'rgba(239, 68, 68, 0.08)',
        badge: 'XGBoost ML',
      });
    } else if (fraudProb >= 0.25) {
      factorCards.push({
        id: 'ml_fraud_med',
        icon: <AlertTriangle size={18} style={{ color: '#f59e0b' }} />,
        title: '🟡 Moderate ML Fraud Probability',
        value: `Fraud probability: ${formatPercent(fraudProb * 100, 1)}`,
        description: 'XGBoost ML model detected moderate probability of anomalous behavior.',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.35)',
        bg: 'rgba(245, 158, 11, 0.08)',
        badge: 'XGBoost ML',
      });
    }
  }

  // 2. Unusual Transaction Timing (Temporal Analysis)
  if ((tempScore !== null && tempScore >= 30) || temporalReason) {
    factorCards.push({
      id: 'temporal',
      icon: <Clock size={18} style={{ color: '#38bdf8' }} />,
      title: '🕒 Unusual Transaction Timing',
      value: temporalReason || `Temporal Anomaly Score: ${tempScore ? formatScore(tempScore) : '35'}/100`,
      description: 'Temporal behavior indicates elevated risk.',
      color: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.35)',
      bg: 'rgba(56, 189, 248, 0.08)',
      badge: 'Temporal Signal',
    });
  }

  // 3. Elevated Transaction Activity / Surge
  if ((surgScore !== null && surgScore >= 30) || surgeReason) {
    factorCards.push({
      id: 'surge',
      icon: <Zap size={18} style={{ color: '#f59e0b' }} />,
      title: '⚡ Elevated Transaction Activity',
      value: surgeReason || `Surge Velocity Score: ${surgScore ? formatScore(surgScore) : '40'}/100`,
      description: 'Recent transaction activity shows an unusual surge.',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.35)',
      bg: 'rgba(245, 158, 11, 0.08)',
      badge: 'Surge Engine',
    });
  }

  // 4. Unusual Transaction Pattern (Statistical PCA Feature Space)
  if (hasPatternAnomaly) {
    factorCards.push({
      id: 'pattern',
      icon: <Search size={18} style={{ color: '#a855f7' }} />,
      title: '🔍 Unusual Transaction Pattern',
      value: patScore !== null ? `Pattern Anomaly Score: ${formatScore(patScore)}/100` : 'Statistical PCA feature anomaly',
      description: 'The transaction pattern contributes to elevated risk.',
      color: '#a855f7',
      border: 'rgba(168, 85, 247, 0.35)',
      bg: 'rgba(168, 85, 247, 0.08)',
      badge: 'Pattern Analysis',
    });
  }

  // 5. Amount-Related Signal (ONLY if backend provided an amount reason)
  if (amountReason) {
    factorCards.push({
      id: 'amount',
      icon: <IndianRupee size={18} style={{ color: '#fbbf24' }} />,
      title: '💰 Transaction Amount Signal',
      value: amountReason,
      description: 'Transaction monetary value triggered amount anomaly threshold.',
      color: '#fbbf24',
      border: 'rgba(251, 191, 36, 0.35)',
      bg: 'rgba(251, 191, 36, 0.08)',
      badge: 'Amount Signal',
    });
  }

  // 6. Overall Composite Risk
  if (rScore !== null || rLevel) {
    const isHigh = rLevel === 'HIGH' || (rScore !== null && rScore >= 70);
    const isMed = rLevel === 'MEDIUM' || (rScore !== null && rScore >= 30);
    const riskThemeColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

    factorCards.push({
      id: 'overall_risk',
      icon: <Target size={18} style={{ color: riskThemeColor }} />,
      title: '🎯 Overall Risk',
      value: `Risk Score: ${rScore !== null ? formatScore(rScore) : '—'}/100`,
      description: `Risk Level: ${rLevel.toUpperCase()}${effectiveDecision ? ` • Automated Action: ${effectiveDecision}` : ''}`,
      color: riskThemeColor,
      border: isHigh ? 'rgba(239, 68, 68, 0.4)' : isMed ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)',
      bg: isHigh ? 'rgba(239, 68, 68, 0.1)' : isMed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      badge: `Decision: ${effectiveDecision}`,
    });
  }

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{title}</span>
          </div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      </div>

      {factorCards.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {factorCards.map((factor) => (
            <div
              key={factor.id}
              style={{
                background: factor.bg || '#0f172a',
                border: `1px solid ${factor.border || 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {factor.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: factor.color || '#f1f5f9' }}>
                    {factor.title}
                  </div>
                  {factor.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: factor.color || 'var(--text-muted)',
                        border: `1px solid ${factor.border || 'var(--border-subtle)'}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {factor.badge}
                    </span>
                  )}
                </div>

                {factor.value && (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '3px' }}>
                    {factor.value}
                  </div>
                )}

                {factor.description && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    {factor.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#6ee7b7' }}>{emptyMessage}</span>
        </div>
      )}

      {/* Explainability Transparency Footer */}
      <div
        style={{
          marginTop: '14px',
          fontSize: '11px',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px',
          lineHeight: 1.4,
        }}
      >
        SurgeShield Multi-Indicator Engine: Combines XGBoost ML fraud probability (50%), PCA pattern analysis (20%), surge velocity (15%), and temporal risk (15%).
      </div>
    </div>
  );
}
