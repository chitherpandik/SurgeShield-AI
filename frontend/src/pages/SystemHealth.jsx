import React, { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Activity,
  Server,
  Database,
  RefreshCw,
  ExternalLink,
  Layers,
  Code2,
  ShieldCheck,
} from 'lucide-react';

export default function SystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await getHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealthData(data);
    } catch (err) {
      setError(err.message || 'Unable to communicate with the SurgeShield AI backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
  const isHealthy = healthData?.status === 'healthy';
  const isDbConnected = healthData?.database === 'connected';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Activity size={28} style={{ color: '#2563eb' }} />
            System Health & Infrastructure Diagnostics
          </h1>
          <p>
            Real-time infrastructure health, database connection probes, and ML engine status
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Probe Health</span>
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState
          title="System Connection Failure"
          message={error}
          onRetry={fetchHealth}
        />
      ) : loading && !healthData ? (
        <LoadingState message="Testing backend API and database connections..." height="300px" />
      ) : (
        <>
          {/* Main Status Grid */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            {/* Backend FastAPI Service */}
            <div
              className="glass-card"
              style={{
                borderTop: `3px solid ${isHealthy ? '#16a34a' : '#dc2626'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  FastAPI Engine
                </span>
                <Server size={18} style={{ color: isHealthy ? '#16a34a' : '#dc2626' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className={`status-dot ${isHealthy ? 'online' : 'offline'}`} />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {isHealthy ? 'Operational' : 'Degraded'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Service: {healthData?.service || 'SurgeShield AI'}
              </div>
            </div>

            {/* MySQL Database Persistence */}
            <div
              className="glass-card"
              style={{
                borderTop: `3px solid ${isDbConnected ? '#2563eb' : '#dc2626'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  MySQL Persistence
                </span>
                <Database size={18} style={{ color: isDbConnected ? '#2563eb' : '#dc2626' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className={`status-dot ${isDbConnected ? 'online' : 'offline'}`} />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {isDbConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Connection Pool: Active (SQLAlchemy ORM)
              </div>
            </div>

            {/* API Latency Probe */}
            <div
              className="glass-card"
              style={{
                borderTop: '3px solid #2563eb',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  HTTP Probe Roundtrip
                </span>
                <Activity size={18} style={{ color: '#2563eb' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {latency !== null ? `${latency} ms` : '—'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Endpoint: GET /health
              </div>
            </div>
          </div>

          {/* Infrastructure & Endpoints Inventory */}
          <div className="dashboard-grid-even" style={{ marginBottom: '24px' }}>
            {/* System Endpoints Reference */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Code2 size={18} style={{ color: '#2563eb' }} />
                  <span>Integrated API Endpoints</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { method: 'GET', path: '/health', desc: 'Health & Database status probe' },
                  { method: 'POST', path: '/analyze', desc: 'Full multi-indicator analysis & persistence' },
                  { method: 'POST', path: '/predict', desc: 'Raw ML fraud probability inference' },
                  { method: 'GET', path: '/transactions', desc: 'Paginated transactions log from MySQL' },
                  { method: 'GET', path: '/transactions/{id}', desc: 'Single transaction deep audit & explainability' },
                  { method: 'GET', path: '/dashboard', desc: 'Executive dashboard aggregate SQL metrics' },
                  { method: 'GET', path: '/risk-summary', desc: 'Risk tier and decision distribution counts' },
                  { method: 'GET', path: '/surge', desc: 'Real-time rolling volume baseline & status' },
                ].map((ep, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: ep.method === 'POST' ? '#eff6ff' : '#f0fdf4',
                          color: ep.method === 'POST' ? '#2563eb' : '#16a34a',
                          border: `1px solid ${ep.method === 'POST' ? '#bfdbfe' : '#bbf7d0'}`,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {ep.method}
                      </span>
                      <span className="mono-text" style={{ color: '#0f172a', fontWeight: 600 }}>
                        {ep.path}
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Specifications */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Layers size={18} style={{ color: '#2563eb' }} />
                  <span>Architecture & Stack Specifications</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    FastAPI ASGI Gateway
                  </div>
                  <div style={{ fontSize: '13px', color: '#0f172a', marginTop: '2px' }}>
                    Base URL: <code className="mono-text" style={{ color: '#2563eb' }}>{baseUrl}</code>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    ML Pipeline & Preprocessing
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    XGBoost (Supervised Classification) & Random Forest baseline with RobustScaler and cyclical trigonometric time encoding.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Persistent Storage Engine
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    MySQL 8.0+ via SQLAlchemy ORM with connection pooling (<code className="mono-text">pool_pre_ping=True</code>).
                  </div>
                </div>

                {/* Direct Links */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <a
                    href={`${baseUrl}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, gap: '6px', textDecoration: 'none' }}
                  >
                    <span>Swagger Interactive Docs</span>
                    <ExternalLink size={12} />
                  </a>

                  <a
                    href={`${baseUrl}/redoc`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, gap: '6px', textDecoration: 'none' }}
                  >
                    <span>Redoc Documentation</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

