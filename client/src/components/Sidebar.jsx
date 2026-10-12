import React from 'react';
import { LayoutDashboard, PlusCircle, FileText, CheckSquare, CheckCircle2, Layers, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Sidebar({ currentView, setCurrentView, pendingCount = 0 }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar no-print">
      <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--colors-muted)',
          padding: '0 0.75rem 0.6rem',
          letterSpacing: '0.08em'
        }}>
          {user.role === 'director' ? 'Director Portal' : user.role === 'accounts' ? 'Accounts Portal' : 'Employee Portal'}
        </div>

        {/* Dashboard (All roles) */}
        <button
          onClick={() => setCurrentView({ view: 'dashboard' })}
          className={`btn ${currentView.view === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            border: currentView.view === 'dashboard' ? 'none' : '1px solid transparent',
            textAlign: 'left',
            fontWeight: currentView.view === 'dashboard' ? 600 : 500,
            borderRadius: 'var(--rounded-md)',
            padding: '10px 14px'
          }}
          data-testid="nav-dashboard"
        >
          <LayoutDashboard size={17} /> Dashboard
        </button>

        {/* Employee Only: Create Voucher */}
        {user.role === 'employee' && (
          <button
            onClick={() => setCurrentView({ view: 'create' })}
            className={`btn ${currentView.view === 'create' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              border: currentView.view === 'create' ? 'none' : '1px solid transparent',
              textAlign: 'left',
              fontWeight: currentView.view === 'create' ? 600 : 500,
              borderRadius: 'var(--rounded-md)',
              padding: '10px 14px'
            }}
            data-testid="nav-create-voucher"
          >
            <PlusCircle size={17} /> Create Voucher
          </button>
        )}

        {/* Employee Only: My Vouchers */}
        {user.role === 'employee' && (
          <button
            onClick={() => setCurrentView({ view: 'vouchers', filterStatus: null })}
            className={`btn ${currentView.view === 'vouchers' && !currentView.filterStatus ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              border: currentView.view === 'vouchers' && !currentView.filterStatus ? 'none' : '1px solid transparent',
              textAlign: 'left',
              fontWeight: currentView.view === 'vouchers' && !currentView.filterStatus ? 600 : 500,
              borderRadius: 'var(--rounded-md)',
              padding: '10px 14px'
            }}
            data-testid="nav-my-vouchers"
          >
            <FileText size={17} /> My Vouchers
          </button>
        )}

        {/* Director Only: Pending Approvals */}
        {user.role === 'director' && (
          <button
            onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Pending Approval' })}
            className={`btn ${currentView.view === 'vouchers' && currentView.filterStatus === 'Pending Approval' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'space-between',
              width: '100%',
              border: currentView.view === 'vouchers' && currentView.filterStatus === 'Pending Approval' ? 'none' : '1px solid transparent',
              textAlign: 'left',
              fontWeight: currentView.filterStatus === 'Pending Approval' ? 600 : 500,
              borderRadius: 'var(--rounded-md)',
              padding: '10px 14px'
            }}
            data-testid="nav-pending-approvals"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={17} /> Pending Approvals
            </div>
            {pendingCount > 0 && (
              <span style={{
                background: 'var(--colors-brand-peach)',
                color: 'var(--colors-ink)',
                borderRadius: 'var(--rounded-pill)',
                fontSize: '0.7rem',
                padding: '2px 8px',
                fontWeight: 700
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        )}

        {/* Director Only: All Approvals */}
        {user.role === 'director' && (
          <button
            onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Approved' })}
            className={`btn ${currentView.view === 'vouchers' && currentView.filterStatus === 'Approved' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              border: currentView.view === 'vouchers' && currentView.filterStatus === 'Approved' ? 'none' : '1px solid transparent',
              textAlign: 'left',
              fontWeight: currentView.filterStatus === 'Approved' ? 600 : 500,
              borderRadius: 'var(--rounded-md)',
              padding: '10px 14px'
            }}
            data-testid="nav-all-approvals"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={17} /> All Approvals
            </div>
          </button>
        )}

        {/* Director & Accounts: All Vouchers */}
        {(user.role === 'director' || user.role === 'accounts') && (
          <button
            onClick={() => setCurrentView({ view: 'vouchers', filterStatus: null })}
            className={`btn ${currentView.view === 'vouchers' && !currentView.filterStatus ? 'btn-primary' : 'btn-outline'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              border: currentView.view === 'vouchers' && !currentView.filterStatus ? 'none' : '1px solid transparent',
              textAlign: 'left',
              fontWeight: currentView.view === 'vouchers' && !currentView.filterStatus ? 600 : 500,
              borderRadius: 'var(--rounded-md)',
              padding: '10px 14px'
            }}
            data-testid="nav-all-vouchers"
          >
            <Layers size={17} /> All Vouchers
          </button>
        )}
      </div>

      {/* Role Footer */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--colors-surface-strong)',
        background: 'var(--colors-surface-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--colors-body-strong)' }}>
          <ShieldCheck size={16} color="var(--colors-brand-teal)" />
          <span>Role: <strong>{user.role.toUpperCase()}</strong></span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--colors-muted)', marginTop: '0.35rem' }}>
          Prachay Securities Pvt Ltd
        </p>
      </div>
    </aside>
  );
}
