import React from 'react';
import useDashboard from '../hooks/useDashboard';
import StatCard from '../components/StatCard';
import SurgeCard from '../components/SurgeCard';
import FraudDistribution from '../components/FraudDistribution';
import TransactionTimeline from '../components/TransactionTimeline';
import RiskScoreDistribution from '../components/RiskScoreDistribution';
import RiskFactors from '../components/RiskFactors';
import PatternAnalysis from '../components/PatternAnalysis';
import SecuritySensitivity from '../components/SecuritySensitivity';
import TransactionTable from '../components/TransactionTable';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';

import {
  CreditCard,
  ShieldAlert,
  Zap,
  IndianRupee,
  ShieldCheck,
  Activity,
  Sliders,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatScore } from '../utils/formatters';

export default function Dashboard() {
  const {
    dashboardData,
    surgeData,
    riskSummaryData,
    recentTransactions,
    healthData,
    loading,
    error,
    refresh,
  } = useDashboard(15);

  if (loading && !dashboardData) {
    return (
      <div className="page-container">
        <LoadingState message="Connecting to SurgeShield AI Engine & Loading Telemetry..." height="400px" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="page-container">
        <ErrorState
          title="Backend Telemetry Connection Failed"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  // Safe data extraction from real backend responses
  const totalTxns = dashboardData?.total_analyzed_transactions ?? 0;
  const fraudCount = dashboardData?.fraud_count ?? 0;
  const fraudPct = dashboardData?.fraud_percentage ?? 0.0;
  const totalAmount = dashboardData?.total_transaction_amount ?? 0.0;
  const suspiciousAmount = dashboardData?.suspicious_transaction_amount ?? 0.0;
  const avgRisk = dashboardData?.average_risk ?? 0.0;
  const surgeScore = surgeData?.surge_score ?? dashboardData?.current_surge_score ?? 0.0;
  const surgeStatus = surgeData?.surge_status || 'Normal Volume';

  // Latest transaction for explainability & pattern vector display
  const latestTx = recentTransactions.length > 0 ? recentTransactions[0] : null;

  return (
    <div className="page-container">
      {/* Top Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={28} style={{ color: '#2563eb' }} />
            Financial Security Command Center
          </h1>
          <p>
            SurgeShield AI real-time fraud intelligence, volume burst radar, and automated decision compliance
          </p>
        </div>

        <div className="page-actions">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: '#16a34a',
            }}
          >
            <span className="status-dot online pulse-indicator" />
            <span style={{ fontWeight: 700 }}>Continuous Surveillance Active</span>
          </div>
        </div>
      </div>

      {/* 1. TOP KPI ROW (4 CARDS with strictly real backend values) */}
      <div className="stats-grid">
        <StatCard
          title="Total Transactions"
          value={formatNumber(totalTxns)}
          subtitle={`Total Portfolio Volume: ${formatCurrency(totalAmount)}`}
          icon={CreditCard}
          color="#2563eb"
          badge={
            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>
              Live MySQL Log
            </span>
          }
        />

        <StatCard
          title="Fraud Detected"
          value={formatNumber(fraudCount)}
          subtitle={`Incidence Rate: ${formatPercent(fraudPct)}`}
          icon={ShieldAlert}
          color="#dc2626"
          badge={
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
              Avg Risk: {formatScore(avgRisk)}
            </span>
          }
        />

        <StatCard
          title="Current Surge"
          value={`${formatScore(surgeScore)}`}
          subtitle={`Status: ${surgeStatus}`}
          icon={Zap}
          color={surgeStatus === 'Suspicious Surge' ? '#dc2626' : surgeStatus === 'Genuine Surge' ? '#0284c7' : '#2563eb'}
          badge={
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: surgeStatus === 'Suspicious Surge' ? '#fef2f2' : surgeStatus === 'Genuine Surge' ? '#f0f9ff' : '#eff6ff',
                color: surgeStatus === 'Suspicious Surge' ? '#dc2626' : surgeStatus === 'Genuine Surge' ? '#0284c7' : '#2563eb',
                border: `1px solid ${surgeStatus === 'Suspicious Surge' ? '#fecaca' : surgeStatus === 'Genuine Surge' ? '#bae6fd' : '#bfdbfe'}`,
              }}
            >
              {surgeStatus}
            </span>
          }
        />

        <StatCard
          title="Amount at Risk"
          value={formatCurrency(suspiciousAmount)}
          subtitle="Flagged / Intercepted Volume"
          icon={IndianRupee}
          color="#d97706"
          badge={
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>
              Protected
            </span>
          }
        />
      </div>

      {/* 2. TRANSACTION ACTIVITY TIMELINE */}
      <div style={{ marginBottom: '24px' }}>
        <TransactionTimeline
          transactions={recentTransactions}
          loading={loading && !recentTransactions.length}
        />
      </div>

      {/* 4. CLASSIFICATION BREAKDOWN + SURGE VELOCITY RADAR */}
      <div className="dashboard-grid-even" style={{ marginBottom: '24px' }}>
        <FraudDistribution dashboardData={dashboardData} loading={loading} />
        <SurgeCard surgeData={surgeData} loading={loading} />
      </div>

      {/* 5. RISK SCORE & DECISION DISTRIBUTION BAR CHART */}
      <div style={{ marginBottom: '24px' }}>
        <RiskScoreDistribution riskSummaryData={riskSummaryData} loading={loading} />
      </div>

      {/* 6. "WHY THIS TRANSACTION WAS FLAGGED" + PATTERN ANALYSIS */}
      <div className="dashboard-grid-even" style={{ marginBottom: '24px' }}>
        <RiskFactors
          transaction={latestTx}
          reasons={
            latestTx?.reasons || [
              `Real-time portfolio average risk score is ${formatScore(avgRisk)} / 100`,
              `${formatNumber(fraudCount)} fraudulent attempts intercepted and blocked`,
              `Surge engine tracking rolling hourly baseline (${formatScore(surgeData?.baseline_volume || 50)} tx/hr)`,
            ]
          }
          decision={latestTx?.decision || 'APPROVE'}
          title="🧠 Why This Transaction Was Flagged"
          subtitle="Understandable fraud-risk factor decomposition based on available telemetry"
        />

        <PatternAnalysis
          scores={{
            ml_score: (latestTx?.fraud_probability ? latestTx.fraud_probability * 100 : avgRisk),
            surge_score: (latestTx?.surge_score ?? surgeScore),
            temporal_score: (latestTx?.temporal_score ?? 25),
            pattern_score: (latestTx?.pattern_score ?? 35),
            risk_score: (latestTx?.risk_score ?? avgRisk),
          }}
          title="Attack Pattern Analysis"
          subtitle="Multi-dimensional indicator vector across PCA and volume space"
        />
      </div>

      {/* 7. SECURITY SENSITIVITY CONTROLS */}
      <div style={{ marginBottom: '24px' }}>
        <SecuritySensitivity />
      </div>

      {/* 8. RECENT HIGH-RISK TRANSACTIONS AUDIT LOG */}
      <div>
        <TransactionTable
          transactions={recentTransactions}
          loading={loading && !recentTransactions.length}
          title="Recent Transactions Audit Log"
          subtitle="Real-time transaction evaluations stored in MySQL database"
          showViewAll={true}
          maxRows={10}
        />
      </div>
    </div>
  );
}

