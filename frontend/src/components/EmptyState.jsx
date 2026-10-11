import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No Records Found',
  message = 'There are no analyzed transactions matching the current criteria in MySQL storage.',
  action,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Inbox size={24} />
      </div>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', maxWidth: '400px', lineHeight: 1.5 }}>
        {message}
      </p>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
}
