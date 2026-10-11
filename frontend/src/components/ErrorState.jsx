import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Failed to Load Intelligence Data',
  message = 'Unable to communicate with the SurgeShield AI backend. Please verify that FastAPI is running.',
  onRetry,
}) {
  return (
    <div
      style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        margin: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
        }}
      >
        <AlertCircle size={24} />
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fca5a5', marginBottom: '4px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '520px', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '6px', gap: '6px' }}
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
