/**
 * Utility functions for Risk, Decision, and Surge classification styles and badges.
 * AI Fraud Intelligence & Risk Intelligence Theme.
 */

/**
 * Get color metadata for qualitative risk levels
 * @param {string} level - 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 */
export function getRiskLevelConfig(level) {
  const normalized = (level || 'LOW').toUpperCase();
  switch (normalized) {
    case 'LOW':
      return {
        label: 'LOW RISK',
        color: '#34d399',
        bg: 'rgba(16, 185, 129, 0.14)',
        border: 'rgba(16, 185, 129, 0.35)',
        badgeClass: 'risk-badge-low',
        textClass: 'text-emerald-400',
        scoreRange: '0 – 29',
      };
    case 'MEDIUM':
    case 'MED':
      return {
        label: 'MEDIUM RISK',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.14)',
        border: 'rgba(245, 158, 11, 0.35)',
        badgeClass: 'risk-badge-med',
        textClass: 'text-amber-400',
        scoreRange: '30 – 69',
      };
    case 'HIGH':
      return {
        label: 'HIGH RISK',
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.4)',
        badgeClass: 'risk-badge-high',
        textClass: 'text-red-400',
        scoreRange: '70 – 100',
      };
    case 'CRITICAL':
      return {
        label: 'CRITICAL RISK',
        color: '#fca5a5',
        bg: 'rgba(220, 38, 38, 0.25)',
        border: 'rgba(220, 38, 38, 0.5)',
        badgeClass: 'risk-badge-critical',
        textClass: 'text-red-300',
        scoreRange: '85 – 100',
      };
    default:
      return {
        label: normalized,
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
        border: 'rgba(148, 163, 184, 0.25)',
        badgeClass: 'risk-badge-neutral',
        textClass: 'text-slate-400',
        scoreRange: 'N/A',
      };
  }
}

/**
 * Get color and styling for Automated Decision actions
 * @param {string} decision - 'APPROVE' | 'VERIFY' | 'BLOCK'
 */
export function getDecisionConfig(decision) {
  const normalized = (decision || 'APPROVE').toUpperCase();
  switch (normalized) {
    case 'APPROVE':
      return {
        label: 'APPROVE',
        description: 'Transaction cleared automated safety checks',
        color: '#34d399',
        bg: 'rgba(16, 185, 129, 0.14)',
        border: 'rgba(16, 185, 129, 0.35)',
        badgeClass: 'decision-badge-approve',
        iconName: 'CheckCircle',
      };
    case 'VERIFY':
      return {
        label: 'VERIFY',
        description: 'Flagged for 2FA / secondary step-up authentication',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.14)',
        border: 'rgba(245, 158, 11, 0.35)',
        badgeClass: 'decision-badge-verify',
        iconName: 'AlertTriangle',
      };
    case 'BLOCK':
      return {
        label: 'BLOCK',
        description: 'Automated block enforced due to high fraud probability',
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.4)',
        badgeClass: 'decision-badge-block',
        iconName: 'ShieldAlert',
      };
    default:
      return {
        label: normalized,
        description: 'Pending evaluation',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
        border: 'rgba(148, 163, 184, 0.25)',
        badgeClass: 'decision-badge-neutral',
        iconName: 'HelpCircle',
      };
  }
}

/**
 * Get styling and classification for Surge Status
 * @param {string} status - 'Normal Volume' | 'Genuine Surge' | 'Suspicious Surge'
 */
export function getSurgeStatusConfig(status) {
  const normalized = status || 'Normal Volume';
  switch (normalized) {
    case 'Genuine Surge':
      return {
        label: 'GENUINE SURGE',
        subtitle: 'High transaction volume with low fraud indicators (e.g. Flash Sale, Promotion)',
        color: '#22d3ee',
        bg: 'rgba(6, 182, 212, 0.14)',
        border: 'rgba(6, 182, 212, 0.35)',
        badgeClass: 'surge-badge-genuine',
        pillColor: '#06b6d4',
      };
    case 'Suspicious Surge':
      return {
        label: 'SUSPICIOUS SURGE',
        subtitle: 'Elevated transaction volume accompanied by concentrated fraud patterns',
        color: '#f87171',
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.4)',
        badgeClass: 'surge-badge-suspicious',
        pillColor: '#ef4444',
      };
    case 'Normal Volume':
    default:
      return {
        label: 'NORMAL VOLUME',
        subtitle: 'Transaction velocity is within expected rolling baseline limits',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.3)',
        badgeClass: 'surge-badge-normal',
        pillColor: '#38bdf8',
      };
  }
}

/**
 * Derive color for a continuous 0-100 score
 * @param {number} score (0 to 100)
 */
export function getScoreColor(score) {
  const s = Number(score) || 0;
  if (s < 30) return '#10b981'; // green
  if (s < 70) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

