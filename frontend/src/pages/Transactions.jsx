import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DecisionBadge from '../components/DecisionBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  formatCurrency,
  formatProbability,
  formatScore,
  formatDateTime,
  formatTimeOffset,
  formatNumber,
} from '../utils/formatters';
import {
  ListFilter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const fetchTransactionList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions(skip, limit);
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve transactions history from MySQL database.');
    } finally {
      setLoading(false);
    }
  }, [skip, limit]);

  useEffect(() => {
    fetchTransactionList();
  }, [fetchTransactionList]);

  // Client-side quick filtering on currently loaded page
  const filteredTransactions = transactions.filter((tx) => {
    // Search match
    const matchSearch =
      !searchTerm ||
      String(tx.id).includes(searchTerm) ||
      String(tx.amount).includes(searchTerm) ||
      (tx.decision && tx.decision.toLowerCase().includes(searchTerm.toLowerCase()));

    // Decision match
    const matchDecision =
      decisionFilter === 'ALL' ||
      (tx.decision && tx.decision.toUpperCase() === decisionFilter);

    // Risk match
    const matchRisk =
      riskFilter === 'ALL' ||
      (tx.risk_level && tx.risk_level.toUpperCase() === riskFilter);

    return matchSearch && matchDecision && matchRisk;
  });

  const handleNextPage = () => {
    setSkip((prev) => prev + limit);
  };

  const handlePrevPage = () => {
    setSkip((prev) => Math.max(0, prev - limit));
  };

  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ListFilter size={28} style={{ color: '#2563eb' }} />
            Persistent Transactions Log
          </h1>
          <p>
            Complete audit trail of real-time multi-indicator evaluated transactions from MySQL
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={() => navigate('/analyze')}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Zap size={14} />
            <span>Analyze New</span>
          </button>

          <button
            onClick={fetchTransactionList}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Refresh database records"
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
              }}
            />
            <input
              type="text"
              placeholder="Search by ID, amount, or decision..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Decision Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Decision:</span>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              <option value="ALL">All Decisions</option>
              <option value="APPROVE">Approved (Safe)</option>
              <option value="VERIFY">Verified (2FA)</option>
              <option value="BLOCK">Blocked (Fraud)</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Risk (&lt;30)</option>
              <option value="MEDIUM">Medium Risk (30-69)</option>
              <option value="HIGH">High Risk (≥70)</option>
            </select>
          </div>

          {/* Rows Per Page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Limit:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setSkip(0);
              }}
              className="input-field"
              style={{ width: 'auto', padding: '8px 12px' }}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card">
        {error ? (
          <ErrorState
            title="Unable to Retrieve Transaction Records"
            message={error}
            onRetry={fetchTransactionList}
          />
        ) : loading ? (
          <LoadingState message="Querying MySQL persistent database..." height="300px" />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            title="No Matching Transactions"
            message={
              searchTerm || decisionFilter !== 'ALL' || riskFilter !== 'ALL'
                ? 'No transactions matched your active search or filter parameters.'
                : 'The database currently contains no transaction evaluations.'
            }
            action={
              (searchTerm || decisionFilter !== 'ALL' || riskFilter !== 'ALL') ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDecisionFilter('ALL');
                    setRiskFilter('ALL');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate('/analyze')}
                  className="btn btn-primary btn-sm"
                >
                  Analyze First Transaction
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ingestion Time</th>
                    <th>Amount</th>
                    <th>Fraud Prob</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Decision</th>
                    <th style={{ textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => {
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
                          >
                            <ExternalLink size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 8px 4px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '12px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Showing page <strong style={{ color: '#0f172a' }}>{currentPage}</strong> (Offset: {skip}, Limit: {limit})
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrevPage}
                  disabled={skip === 0 || loading}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '4px' }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={transactions.length < limit || loading}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '4px' }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

