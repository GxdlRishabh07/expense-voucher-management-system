import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { VouchersListPage } from './pages/VouchersListPage.jsx';
import { VoucherCreatePage } from './pages/VoucherCreatePage.jsx';
import { VoucherDetailPage } from './pages/VoucherDetailPage.jsx';
import { VoucherEditPage } from './pages/VoucherEditPage.jsx';
import { api } from './services/api.js';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState({ view: 'dashboard' });
  const [pendingCount, setPendingCount] = useState(0);

  // Periodically refresh pending count for director
  useEffect(() => {
    if (user?.role === 'director') {
      api.get('/dashboard/stats')
        .then((res) => {
          if (res.success && res.data) {
            setPendingCount(res.data.pendingApprovalCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, currentView]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--colors-canvas)', color: 'var(--colors-ink)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid var(--colors-hairline)', borderTopColor: 'var(--colors-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.25rem' }} />
          <div style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.2px' }}>Initializing Expense Voucher System...</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--colors-muted)', marginTop: '0.25rem' }}>Prachay Securities Pvt Ltd</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container" data-testid="app-root">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        pendingCount={pendingCount}
      />

      <div className="main-content">
        <Navbar />

        <main className="page-body">
          {currentView.view === 'dashboard' && (
            <DashboardPage setCurrentView={setCurrentView} />
          )}

          {currentView.view === 'vouchers' && (
            <VouchersListPage
              key={currentView.filterStatus || 'all'}
              setCurrentView={setCurrentView}
              initialStatus={currentView.filterStatus}
            />
          )}

          {currentView.view === 'create' && (
            <VoucherCreatePage setCurrentView={setCurrentView} />
          )}

          {currentView.view === 'detail' && (
            <VoucherDetailPage
              voucherId={currentView.voucherId}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView.view === 'edit' && (
            <VoucherEditPage
              voucherId={currentView.voucherId}
              setCurrentView={setCurrentView}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
