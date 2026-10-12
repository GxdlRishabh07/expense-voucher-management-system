import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, Building, Shield, ChevronDown } from 'lucide-react';

export function Navbar({ onToggleSidebar }) {
  const { user, logout, switchDemoAccount } = useAuth();

  const demoAccounts = [
    { name: 'Rahul Sharma', email: 'rahul@prachay.com', role: 'Employee', dept: 'Engineering' },
    { name: 'Priya Patel', email: 'priya@prachay.com', role: 'Employee', dept: 'Marketing' },
    { name: 'Amit Verma', email: 'director@prachay.com', role: 'Director', dept: 'Executive' },
    { name: 'Sneha Rao', email: 'accounts@prachay.com', role: 'Accounts', dept: 'Finance' },
  ];

  return (
    <header style={{
      background: 'var(--colors-canvas)',
      borderBottom: '1px solid var(--colors-hairline)',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(8px)'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--rounded-md)',
          background: 'var(--colors-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--colors-on-primary)',
          fontWeight: 700,
          fontSize: '1.05rem',
          letterSpacing: '-0.5px'
        }}>
          P
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--colors-ink)', letterSpacing: '-0.2px' }}>
            Prachay Securities
          </h2>
          <p style={{ fontSize: '0.725rem', color: 'var(--colors-muted)', margin: 0 }}>
            Expense Voucher Management System
          </p>
        </div>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Quick Demo Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--colors-surface-soft)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--rounded-pill)',
          border: '1px solid var(--colors-surface-strong)'
        }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--colors-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Role:
          </span>
          <select
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--colors-ink)',
              cursor: 'pointer',
              outline: 'none'
            }}
            value={user?.email}
            onChange={(e) => switchDemoAccount(e.target.value)}
            data-testid="demo-role-switcher"
          >
            {demoAccounts.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.name} ({acc.role} - {acc.dept})
              </option>
            ))}
          </select>
        </div>

        {/* Current User Badge */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: user.role === 'director' ? 'var(--colors-brand-lavender)' : user.role === 'accounts' ? 'var(--colors-brand-mint)' : 'var(--colors-surface-card)',
              color: user.role === 'director' ? '#4a154b' : user.role === 'accounts' ? '#0f4c3a' : 'var(--colors-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--colors-ink)' }}>
                {user.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className={`badge badge-role-${user.role}`} style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                  {user.role === 'director' ? 'Director' : user.role === 'accounts' ? 'Accounts Team' : 'Employee'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--colors-muted)' }}>• {user.department}</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-sm btn-secondary"
          title="Sign Out"
          data-testid="logout-btn"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
}
