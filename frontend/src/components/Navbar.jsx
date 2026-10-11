import React from 'react';
import { Shield, RefreshCw, Database, Clock, Menu } from 'lucide-react';

export default function Navbar({
  healthData,
  lastUpdated,
  refreshing,
  onRefresh,
  isAutoRefreshEnabled,
  onToggleAutoRefresh,
  onToggleSidebar,
}) {
  const isHealthy = healthData?.status === 'healthy';
  const isDbConnected = healthData?.database === 'connected';

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
      }}
    >
      {/* Left side: Mobile Toggle & Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none', padding: '6px' }}
            id="mobile-sidebar-toggle"
            title="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
                SURGESHIELD <span style={{ color: '#38bdf8' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                Adaptive Engine
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
              Real-Time Adaptive Fraud Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Health status indicator, live timer, refresh controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* System & DB Health Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${isHealthy ? 'online' : 'offline'}`} />
            <span style={{ fontWeight: 600, color: isHealthy ? '#34d399' : '#f87171' }}>
              {isHealthy ? 'System Operational' : 'System Degraded'}
            </span>
          </div>

          <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>|</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: isDbConnected ? '#34d399' : '#f87171',
            }}
          >
            <Database size={12} />
            <span>MySQL {isDbConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>

        {/* Live Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#94a3b8',
            background: 'rgba(13, 22, 41, 0.6)',
            border: '1px solid var(--border-subtle)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Clock size={13} style={{ color: '#64748b' }} />
          <span>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</span>
        </div>

        {/* Auto Refresh Toggle */}
        <button
          onClick={onToggleAutoRefresh}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '11px',
            padding: '5px 10px',
            background: isAutoRefreshEnabled ? 'rgba(59, 130, 246, 0.15)' : 'rgba(15, 23, 42, 0.6)',
            borderColor: isAutoRefreshEnabled ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)',
            color: isAutoRefreshEnabled ? '#38bdf8' : '#94a3b8',
          }}
          title="Toggle 30-Second Automatic Polling"
        >
          <span>Auto-Sync: {isAutoRefreshEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px' }}
          title="Manual Telemetry Refresh"
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', color: '#38bdf8' }} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
}

