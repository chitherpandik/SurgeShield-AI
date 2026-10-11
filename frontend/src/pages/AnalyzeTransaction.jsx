import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeTransaction } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DecisionBadge from '../components/DecisionBadge';
import RiskGauge from '../components/RiskGauge';
import PatternAnalysis from '../components/PatternAnalysis';
import RiskFactors from '../components/RiskFactors';
import { formatCurrency, formatProbability, formatScore, formatNumber } from '../utils/formatters';
import {
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Cpu,
  ExternalLink,
  CheckCircle,
  Database,
  ArrowDown,
  Search,
  Activity,
} from 'lucide-react';

// Benchmark test payloads
const PRESETS = [
  {
    name: 'Normal Retail Transaction',
    description: 'Standard daytime retail transaction with normal PCA features',
    badge: 'Legitimate',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    data: {
      Time: 100.0,
      V1: -1.3598, V2: -0.0728, V3: 2.5363, V4: 1.3782,
      V5: -0.3383, V6: 0.4624, V7: 0.2396, V8: 0.0987,
      V9: 0.3638, V10: 0.0908, V11: -0.5516, V12: -0.6178,
      V13: -0.9914, V14: -0.3112, V15: 1.4682, V16: -0.4704,
      V17: 0.2079, V18: 0.0258, V19: 0.4039, V20: 0.2514,
      V21: -0.0183, V22: 0.2778, V23: -0.1105, V24: 0.0669,
      V25: 0.1285, V26: -0.1891, V27: 0.1335, V28: -0.0211,
      Amount: 149.62,
    },
  },
  {
    name: 'High-Risk Fraud Attack',
    description: 'Off-peak zero-amount card test with severe PCA anomalies in V14 & V17',
    badge: 'Malicious',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    badgeBorder: '#fecaca',
    data: {
      Time: 406.0,
      V1: -2.3122, V2: 1.9519, V3: -1.6098, V4: 3.9979,
      V5: -0.5222, V6: -1.4265, V7: -2.5373, V8: 1.3916,
      V9: -2.7700, V10: -2.7722, V11: 3.2020, V12: -2.8999,
      V13: -0.5952, V14: -4.2892, V15: 0.3897, V16: -1.1407,
      V17: -2.8300, V18: -0.0168, V19: 0.4169, V20: 0.1269,
      V21: 0.5172, V22: -0.0350, V23: -0.4652, V24: 0.3202,
      V25: 0.0445, V26: 0.1778, V27: 0.2611, V28: -0.1432,
      Amount: 0.00,
    },
  },
  {
    name: 'Flash Sale High-Volume Surge',
    description: 'High burst timestamp with clean features and legitimate transaction size',
    badge: 'Genuine Surge',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    data: {
      Time: 3600.0,
      V1: 0.8542, V2: -0.1245, V3: 1.1023, V4: 0.4512,
      V5: -0.2104, V6: 0.1542, V7: 0.0451, V8: 0.0214,
      V9: 0.1245, V10: -0.0541, V11: 0.2415, V12: 0.1045,
      V13: -0.1045, V14: 0.0214, V15: 0.4512, V16: 0.1245,
      V17: 0.0541, V18: -0.0124, V19: 0.1024, V20: -0.0541,
      V21: -0.0451, V22: -0.0124, V23: 0.0541, V24: 0.1245,
      V25: -0.0214, V26: 0.0451, V27: 0.0124, V28: 0.0045,
      Amount: 89.99,
    },
  },
  {
    name: 'Suspicious High-Value Midnight',
    description: 'Large monetary amount during off-peak hours with moderate deviations',
    badge: 'Suspicious',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    data: {
      Time: 7200.0, // 2:00 AM off-peak
      V1: -1.8542, V2: 1.4215, V3: -0.9541, V4: 2.1245,
      V5: -0.8541, V6: -0.6541, V7: -1.2451, V8: 0.8541,
      V9: -1.4512, V10: -1.6541, V11: 1.8541, V12: -1.4512,
      V13: -0.4512, V14: -2.1245, V15: 0.1542, V16: -0.8541,
      V17: -1.4512, V18: 0.1245, V19: 0.3541, V20: 0.2541,
      V21: 0.2451, V22: -0.1542, V23: -0.2451, V24: 0.1542,
      V25: 0.0541, V26: 0.1245, V27: 0.1542, V28: -0.0541,
      Amount: 2450.00,
    },
  },
];

const INITIAL_FORM = PRESETS[0].data;

export default function AnalyzeTransaction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0.0,
    }));
  };

  const loadPreset = (index) => {
    setSelectedPresetIndex(index);
    setFormData(PRESETS[index].data);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setSelectedPresetIndex(0);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Strictly send numerical payload matching TransactionRequest
      const response = await analyzeTransaction(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Zap size={28} style={{ color: '#2563eb' }} />
            Transaction Intelligence & Risk Analysis
          </h1>
          <p>
            Evaluate transaction parameters against XGBoost ML model, surge velocity, temporal anomalies, and PCA feature deviations
          </p>
        </div>
      </div>

      {/* Preset Test Case Selector */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={16} style={{ color: '#2563eb' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
            Quick-Load Benchmark Presets
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(idx)}
              style={{
                background: selectedPresetIndex === idx ? '#eff6ff' : '#ffffff',
                border: `1px solid ${selectedPresetIndex === idx ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {preset.name}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: preset.badgeBg,
                    color: preset.badgeColor,
                    border: `1px solid ${preset.badgeBorder}`,
                  }}
                >
                  {preset.badge}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Form & Live Results */}
      <div className="dashboard-grid-2col" style={{ alignItems: 'start' }}>
        {/* Left Form: Parameter Inputs */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  <span>Transaction Parameters & Feature Space</span>
                </div>
                <div className="card-subtitle">
                  XGBoost ML model input features (anonymized V1–V28 space)
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '12px', gap: '4px' }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Core Monetary & Temporal Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Transaction Amount (₹ / INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.Amount}
                  onChange={(e) => handleInputChange('Amount', e.target.value)}
                  className="input-field mono-text"
                  placeholder="e.g. 149.99"
                  style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Time Offset (Seconds) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={formData.Time}
                  onChange={(e) => handleInputChange('Time', e.target.value)}
                  className="input-field mono-text"
                  placeholder="e.g. 406"
                  style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* PCA Anonymized Feature Matrix (V1 - V28) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Anonymized Input Features (V1 – V28)
                </span>
                <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
                  ● Key Sensitivity Features
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '8px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  paddingRight: '6px',
                }}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((idx) => {
                  const key = `V${idx}`;
                  const isCritical = ['V17', 'V14', 'V12', 'V10', 'V4', 'V11'].includes(key);
                  return (
                    <div key={key}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: isCritical ? '#d97706' : '#64748b',
                          fontWeight: isCritical ? 700 : 500,
                          marginBottom: '3px',
                        }}
                      >
                        <span>{key}</span>
                        {isCritical && <span style={{ fontSize: '9px', color: '#d97706' }}>●</span>}
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData[key] ?? 0}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="input-field mono-text"
                        style={{
                          padding: '6px 8px',
                          fontSize: '12px',
                          color: '#000000',
                          fontWeight: 600,
                          borderColor: isCritical ? '#fde68a' : '#cbd5e1',
                          background: isCritical ? '#fffbeb' : '#ffffff',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, gap: '8px' }}
            >
              <Play size={16} />
              <span>{loading ? 'Evaluating Intelligence Pipeline...' : 'Run Full Fraud & Surge Analysis'}</span>
            </button>
          </form>
        </div>

        {/* Right Panel: Analysis Result */}
        <div>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                color: '#dc2626',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              <strong>Analysis Error: </strong> {error}
            </div>
          )}

          {result ? (
            <div className="glass-card" style={{ border: '1px solid #bfdbfe' }}>
              {/* Top Result Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Automated Decision Engine
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <DecisionBadge decision={result.decision} />
                    <RiskBadge level={result.risk_level} />
                  </div>
                </div>

                {result.transaction_id && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>MySQL Record ID</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                      #{result.transaction_id}
                    </div>
                  </div>
                )}
              </div>

              {/* Gauge & Main Score */}
              <RiskGauge score={result.risk_score} level={result.risk_level} size={220} />

              {/* Individual Multi-Indicator Sub-Score Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  margin: '16px 0',
                }}
              >
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>XGBoost ML Prob (50%)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: result.fraud_probability >= 0.5 ? '#dc2626' : '#2563eb' }}>
                    {formatProbability(result.fraud_probability)}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Surge Velocity (15%)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
                    {formatScore(result.surge_score)}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Temporal Anomaly (15%)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed' }}>
                    {formatScore(result.temporal_score)}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>PCA Pattern Score (20%)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>
                    {formatScore(result.pattern_score)}
                  </div>
                </div>
              </div>

              {/* Explainable Decision Factors */}
              <div style={{ marginTop: '16px' }}>
                <RiskFactors
                  transaction={result}
                  reasons={result.reasons}
                  decision={result.decision}
                  title="🧠 Why This Transaction Was Flagged"
                  subtitle="Explainable fraud-risk factor decomposition based on multi-indicator telemetry"
                />
              </div>

              {/* Persistent Storage Confirmation Action */}
              {result.transaction_id && (
                <button
                  type="button"
                  onClick={() => navigate(`/transactions/${result.transaction_id}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '16px', gap: '6px' }}
                >
                  <Database size={14} style={{ color: '#2563eb' }} />
                  <span>Inspect Full Record #{result.transaction_id} in Database</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#64748b',
                minHeight: '380px',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  marginBottom: '16px',
                }}
              >
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Ready for Intelligence Analysis
              </h3>
              <p style={{ fontSize: '13px', maxWidth: '360px', lineHeight: 1.5 }}>
                Select a benchmark preset above or enter custom transaction parameters, then click <strong>Run Full Fraud & Surge Analysis</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

