import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  ListFilter,
  BarChart3,
  Activity,
  Shield,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: 'Live',
    exact: true,
  },
  {
    to: '/analyze',
    label: 'Analyze Transaction',
    icon: Zap,
    badge: 'XGBoost',
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: ListFilter,
  },
  {
    to: '/risk-summary',
    label: 'Risk Summary',
    icon: BarChart3,
  },
  {
    to: '/system-health',
    label: 'System Health',
    icon: Activity,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const docsUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'}/docs`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 45,
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div
            style={{
              height: 'var(--navbar-height)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              borderBottom: '1px solid var(--border-subtle)',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
                SURGESHIELD <span style={{ color: '#38bdf8' }}>AI</span>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fraud Intelligence
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                padding: '6px 12px 4px',
              }}
            >
              Intelligence Suite
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.35)' : 'transparent'}`,
                    boxShadow: isActive ? '0 0 16px rgba(59, 130, 246, 0.15)' : 'none',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  })}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} style={{ color: 'inherit' }} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#38bdf8',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              background: 'rgba(13, 22, 41, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '10px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
              XGBoost ML Pipeline
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4 }}>
              Multi-indicator real-time scoring with MySQL persistence.
            </div>
          </div>

          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              color: '#94a3b8',
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
            className="sidebar-docs-link"
          >
            <span>FastAPI Docs</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </aside>
    </>
  );
}

