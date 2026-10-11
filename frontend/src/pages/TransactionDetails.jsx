import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransaction } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DecisionBadge from '../components/DecisionBadge';
import RiskGauge from '../components/RiskGauge';
import RiskFactors from '../components/RiskFactors';
import PatternAnalysis from '../components/PatternAnalysis';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  formatCurrency,
  formatProbability,
  formatScore,
  formatDateTime,
  formatTimeOffset,
} from '../utils/formatters';
import {
  ArrowLeft,
  Shield,
  Clock,
  Zap,
  Database,
  CheckCircle,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTx() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransaction(id);
        if (isMounted) {
          setTransaction(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Unable to locate transaction #${id} in MySQL storage.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchTx();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState message={`Fetching transaction #${id} intelligence from MySQL...`} height="400px" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="page-container">
        <button
          onClick={() => navigate('/transactions')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '16px', gap: '6px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Transactions</span>
        </button>

        <ErrorState
          title={`Transaction #${id} Not Found`}
          message={error || 'The requested transaction record does not exist in the MySQL database.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const isBlocked = (transaction.decision || '').toUpperCase() === 'BLOCK';
  const isApproved = (transaction.decision || '').toUpperCase() === 'APPROVE';

  return (
    <div className="page-container">
      {/* Back Button & Header */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/transactions')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px', marginBottom: '12px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Transactions Log</span>
        </button>

        <div className="page-header" style={{ marginBottom: 0 }}>
          <div className="page-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1>
                <span>Transaction Intelligence Audit</span>
                <span style={{ color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                  #{transaction.id}
                </span>
              </h1>
            </div>
            <p>
              Complete multi-indicator factor breakdown and explainable compliance audit report
            </p>
          </div>

          <div className="page-actions">
            <DecisionBadge decision={transaction.decision} />
            <RiskBadge level={transaction.risk_level} />
          </div>
        </div>
      </div>

      {/* Top Banner: Key Metadata */}
      <div
        className="glass-card"
        style={{
          marginBottom: '20px',
          background: isBlocked ? '#fef2f2' : isApproved ? '#f0fdf4' : '#ffffff',
          border: `1px solid ${isBlocked ? '#fecaca' : isApproved ? '#bbf7d0' : 'var(--border-subtle)'}`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Transaction Amount
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(transaction.amount)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Ingestion Timestamp
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '6px' }}>
              {formatDateTime(transaction.created_at)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Offset: {formatTimeOffset(transaction.transaction_time)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              XGBoost ML Classification
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: transaction.prediction === 'Fraud' ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
              {transaction.prediction || 'Legitimate'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Prob: {formatProbability(transaction.fraud_probability)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Composite Risk Score
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: transaction.risk_score >= 70 ? '#dc2626' : transaction.risk_score >= 30 ? '#d97706' : '#16a34a', marginTop: '4px' }}>
              {formatScore(transaction.risk_score)} <span style={{ fontSize: '12px', color: '#64748b' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Gauge + Sub-Scores + Explainability */}
      <div className="dashboard-grid-even" style={{ marginBottom: '24px' }}>
        {/* Left Card: Multi-Indicator Score Breakdown */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">
                <Shield size={18} style={{ color: '#2563eb' }} />
                <span>Multi-Indicator Scoring Engine</span>
              </div>
            </div>

            <RiskGauge score={transaction.risk_score} level={transaction.risk_level} size={220} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>XGBoost ML Prob (50%)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: transaction.fraud_probability >= 0.5 ? '#dc2626' : '#2563eb' }}>
                  {formatProbability(transaction.fraud_probability)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Surge Velocity (15%)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
                  {formatScore(transaction.surge_score)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Temporal Anomaly (15%)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed' }}>
                  {formatScore(transaction.temporal_score)}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>PCA Pattern Score (20%)</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>
                  {formatScore(transaction.pattern_score)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              fontSize: '11px',
              color: '#64748b',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Database size={13} style={{ color: '#2563eb' }} />
            <span>Persisted Record #{transaction.id} in MySQL `transactions` table</span>
          </div>
        </div>

        {/* Right Card: Explainability Reasons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RiskFactors
            transaction={transaction}
            reasons={transaction.reasons}
            decision={transaction.decision}
            title="🧠 Why This Transaction Was Flagged"
            subtitle="Explainable fraud-risk factor decomposition based on multi-indicator telemetry"
          />

          <PatternAnalysis
            scores={{
              ml_score: (transaction.fraud_probability || 0) * 100,
              surge_score: transaction.surge_score || 0,
              temporal_score: transaction.temporal_score || 0,
              pattern_score: transaction.pattern_score || 0,
              risk_score: transaction.risk_score || 0,
            }}
            title="Indicator Feature Vector"
            subtitle="Radar comparison against safe baseline profile"
          />
        </div>
      </div>
    </div>
  );
}

