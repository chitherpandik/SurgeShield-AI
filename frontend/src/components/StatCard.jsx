import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#38bdf8',
  loading = false,
  badge,
  onClick,
}) {
  if (loading) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '90px', height: '14px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '4px' }} />
          <div style={{ width: '36px', height: '36px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '8px' }} />
        </div>
        <div style={{ width: '130px', height: '28px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '6px', margin: '12px 0 8px' }} />
        <div style={{ width: '100px', height: '12px', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '4px' }} />
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        borderLeft: `3px solid ${color}`,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: `${color}18`,
              border: `1px solid ${color}33`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${color}22`,
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: '26px',
          fontWeight: 800,
          color: '#f8fafc',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
          margin: '2px 0 6px',
        }}
      >
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {badge}
        {subtitle && (
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

