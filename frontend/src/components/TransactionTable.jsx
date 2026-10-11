import React from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import DecisionBadge from './DecisionBadge';
import { formatCurrency, formatProbability, formatScore, formatDateTime, formatTimeOffset } from '../utils/formatters';
import { ChevronRight, ExternalLink, FileText } from 'lucide-react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function TransactionTable({
  transactions = [],
  loading = false,
  title = 'Recent Transactions Audit Log',
  subtitle = 'Evaluated transactions persisted in MySQL database (newest first)',
  showViewAll = true,
  maxRows,
}) {
  const navigate = useNavigate();
  const displayedTransactions = maxRows ? transactions.slice(0, maxRows) : transactions;

  if (loading) {
    return (
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} style={{ color: '#2563eb' }} />
            <span>{title}</span>
          </div>
        </div>
        <LoadingState message="Fetching transaction audit log from MySQL..." height="200px" />
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <FileText size={18} style={{ color: '#2563eb' }} />
            <span>{title}</span>
          </div>
          <div className="card-subtitle">{subtitle}</div>
        </div>

        {showViewAll && transactions.length > 0 && (
          <button
            onClick={() => navigate('/transactions')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', gap: '6px' }}
          >
            <span>View Full Log</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {displayedTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions in Database"
          message="Run an analysis in 'Analyze Transaction' or submit transactions to populate the MySQL log."
          action={
            <button
              onClick={() => navigate('/analyze')}
              className="btn btn-primary btn-sm"
            >
              Analyze New Transaction
            </button>
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time / Ingestion</th>
                <th>Amount</th>
                <th>Fraud Probability</th>
                <th>Composite Risk</th>
                <th>Risk Level</th>
                <th>Decision</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.map((tx) => {
                const isBlocked = (tx.decision || '').toUpperCase() === 'BLOCK';
                const isVerify = (tx.decision || '').toUpperCase() === 'VERIFY';
                return (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    style={{
                      background: isBlocked ? '#fff5f5' : isVerify ? '#fffbeb' : '#ffffff',
                    }}
                  >
                    <td>
                      <span className="mono-text" style={{ fontWeight: 700, color: '#2563eb' }}>
                        #{tx.id}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                          {tx.created_at ? formatDateTime(tx.created_at) : `Offset: ${tx.transaction_time}s`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Offset: {formatTimeOffset(tx.transaction_time)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td>
                      <span className="mono-text" style={{ fontWeight: 600, color: tx.fraud_probability >= 0.5 ? '#dc2626' : tx.fraud_probability >= 0.25 ? '#d97706' : '#16a34a' }}>
                        {formatProbability(tx.fraud_probability)}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: tx.risk_score >= 70 ? '#dc2626' : tx.risk_score >= 30 ? '#d97706' : '#16a34a' }}>
                        {formatScore(tx.risk_score)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ 100</span>
                      </span>
                    </td>

                    <td>
                      <RiskBadge level={tx.risk_level} />
                    </td>

                    <td>
                      <DecisionBadge decision={tx.decision} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transactions/${tx.id}`);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="View Full Multi-Indicator Telemetry & Explainability"
                      >
                        <ExternalLink size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
