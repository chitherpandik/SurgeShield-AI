import React, { useState, useEffect, useCallback } from 'react';
import { getRiskSummary, getDashboard } from '../services/api';
import RiskScoreDistribution from '../components/RiskScoreDistribution';
import FraudDistribution from '../components/FraudDistribution';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatScore,
} from '../utils/formatters';
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Scale,
} from 'lucide-react';

export default function RiskIntelligence() {
  const [riskSummary, setRiskSummary] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [riskRes, dashRes] = await Promise.all([
        getRiskSummary(),
        getDashboard(),
      ]);
      setRiskSummary(riskRes);
      setDashboardData(dashRes);
    } catch (err) {
      setError(err.message || 'Unable to retrieve risk summary metrics from MySQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !riskSummary) {
    return (
      <div className="page-container">
        <LoadingState message="Aggregating Risk Intelligence telemetry from MySQL..." height="400px" />
      </div>
    );
  }

  if (error && !riskSummary) {
    return (
      <div className="page-container">
        <ErrorState
          title="Risk Summary Unavailable"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  const lowRisk = riskSummary?.low_risk ?? 0;
  const medRisk = riskSummary?.medium_risk ?? 0;
  const highRisk = riskSummary?.high_risk ?? 0;

  const approved = riskSummary?.approved ?? 0;
  const verified = riskSummary?.verified ?? 0;
  const blocked = riskSummary?.blocked ?? 0;

  const totalEvaluated = approved + verified + blocked;
  const avgRisk = dashboardData?.average_risk ?? 0.0;
  const suspiciousAmt = dashboardData?.suspicious_transaction_amount ?? 0.0;
  const totalAmt = dashboardData?.total_transaction_amount ?? 0.0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={28} style={{ color: '#2563eb' }} />
            Risk Intelligence & Compliance Analytics
          </h1>
          <p>
            Portfolio risk tier breakdowns, automated decision funnels, and fraud mitigation statistics
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Evaluated"
          value={formatNumber(totalEvaluated)}
          subtitle={`Total Portfolio: ${formatCurrency(totalAmt)}`}
          icon={Scale}
          color="#2563eb"
        />

        <StatCard
          title="Approved (Low Risk)"
          value={formatNumber(approved)}
          subtitle={`${formatPercent(totalEvaluated > 0 ? (approved / totalEvaluated) * 100 : 0)} Approval Rate`}
          icon={ShieldCheck}
          color="#16a34a"
        />

        <StatCard
          title="Step-up Verification"
          value={formatNumber(verified)}
          subtitle={`${formatPercent(totalEvaluated > 0 ? (verified / totalEvaluated) * 100 : 0)} 2FA Challenges`}
          icon={AlertTriangle}
          color="#d97706"
        />

        <StatCard
          title="Blocked (High Risk)"
          value={formatNumber(blocked)}
          subtitle={`Protected: ${formatCurrency(suspiciousAmt)}`}
          icon={ShieldAlert}
          color="#dc2626"
        />
      </div>

      {/* Risk & Decision Distributions */}
      <div className="dashboard-grid-even" style={{ marginBottom: '24px' }}>
        <RiskScoreDistribution riskSummaryData={riskSummary} loading={loading} />
        <FraudDistribution dashboardData={dashboardData} loading={loading} />
      </div>

      {/* Deep-Dive Risk Tier Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Tier 1: Low */}
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid #16a34a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Low Risk Tier (&lt; 30)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {formatNumber(lowRisk)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            Transactions with low ML fraud probability and standard customer patterns. Automated banking rules execute instantaneous approval without user disruption.
          </div>
        </div>

        {/* Tier 2: Medium */}
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid #d97706',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Medium Risk Tier (30 – 69)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {formatNumber(medRisk)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            Transactions exhibiting moderate anomaly signals, volume surges, or unusual off-peak timing. Routed to secondary step-up challenge or SMS 2FA verification.
          </div>
        </div>

        {/* Tier 3: High */}
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid #dc2626',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              High Risk Tier (≥ 70)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {formatNumber(highRisk)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            Transactions matching high ML fraud signatures or severe PCA feature distortions. Automated policy enforces immediate block to protect merchant and customer funds.
          </div>
        </div>
      </div>
    </div>
  );
}

