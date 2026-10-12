import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import {
  FileText, Clock, CheckCircle2, XCircle, IndianRupee,
  Layers, PlusCircle, ArrowRight, Eye, Calendar, UserCheck, Activity
} from 'lucide-react';

export function DashboardPage({ setCurrentView }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [directorQueueTab, setDirectorQueueTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id, user?.role]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444' }}>
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, margin: 0, color: 'var(--colors-ink)', letterSpacing: '-0.8px' }}>
            {user.role === 'director' ? 'Director Approval Dashboard' : user.role === 'accounts' ? 'Accounts Monitoring Dashboard' : 'Employee Expense Dashboard'}
          </h1>
          <p style={{ color: 'var(--colors-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Welcome back, <strong style={{ color: 'var(--colors-ink)' }}>{user.name}</strong> • Department: {user.department}
          </p>
        </div>

        {user.role === 'employee' && (
          <button
            onClick={() => setCurrentView({ view: 'create' })}
            className="btn btn-primary"
            data-testid="dashboard-create-btn"
          >
            <PlusCircle size={16} /> Create New Voucher
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. EMPLOYEE DASHBOARD (Section 8 of PDF) */}
      {/* ======================================================== */}
      {user.role === 'employee' && stats && (
        <>
          <div className="stat-grid" data-testid="employee-stat-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Vouchers</div>
                <div className="stat-value" data-testid="stat-total-vouchers">{stats.totalVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-teal)', color: 'var(--colors-on-dark)' }}>
                <Layers size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Draft Vouchers</div>
                <div className="stat-value" data-testid="stat-draft-vouchers">{stats.draftVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-surface-card)', color: 'var(--colors-ink)' }}>
                <FileText size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Pending Approval</div>
                <div className="stat-value" data-testid="stat-pending-vouchers">{stats.pendingApproval}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-peach)', color: 'var(--colors-ink)' }}>
                <Clock size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Approved</div>
                <div className="stat-value" data-testid="stat-approved-vouchers">{stats.approvedVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-mint)', color: '#0f4c3a' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Rejected</div>
                <div className="stat-value" data-testid="stat-rejected-vouchers">{stats.rejectedVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-pink)', color: '#ffffff' }}>
                <XCircle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Amount Claimed</div>
                <div className="stat-value" data-testid="stat-total-claimed">
                  ₹{Number(stats.totalAmountClaimed || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-lavender)', color: '#4a154b' }}>
                <IndianRupee size={22} />
              </div>
            </div>
          </div>

          {/* Recent Vouchers by Employee */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>My Recent Vouchers</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--colors-muted)' }}>Latest expense claims created by you</p>
              </div>
              <button
                onClick={() => setCurrentView({ view: 'vouchers', filterStatus: null })}
                className="btn btn-sm btn-secondary"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            {stats.recentVouchers && stats.recentVouchers.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Voucher #</th>
                      <th>Expense Title</th>
                      <th>Category</th>
                      <th>Expense Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentVouchers.map((v) => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.voucher_number}</td>
                        <td style={{ fontWeight: 500, color: 'var(--colors-ink)' }}>{v.expense_title}</td>
                        <td>{v.expense_category}</td>
                        <td>{v.expense_date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--colors-ink)' }}>₹{Number(v.amount).toLocaleString('en-IN')}</td>
                        <td><StatusBadge status={v.status} /></td>
                        <td>
                          <button
                            onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                            className="btn btn-sm btn-secondary"
                            data-testid={`view-voucher-${v.id}`}
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--colors-muted)' }}>
                No vouchers created yet. Click "Create New Voucher" to get started.
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. DIRECTOR DASHBOARD (Section 8 of PDF) */}
      {/* ======================================================== */}
      {user.role === 'director' && stats && (
        <>
          <div className="stat-grid" data-testid="director-stat-grid">
            <div
              className="stat-card"
              onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Pending Approval' })}
              style={{ cursor: 'pointer' }}
              title="Click to view all pending approvals"
            >
              <div>
                <div className="stat-label">Pending Approval Count</div>
                <div className="stat-value" data-testid="stat-pending-approval-count">{stats.pendingApprovalCount}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-peach)', color: 'var(--colors-ink)' }}>
                <Clock size={22} />
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Approved' })}
              style={{ cursor: 'pointer' }}
              title="Click to view all approved vouchers"
            >
              <div>
                <div className="stat-label">Approved (All Time: {stats.totalApprovedCount || 0})</div>
                <div className="stat-value" data-testid="stat-approved-today">{stats.approvedToday} today</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-teal)', color: 'var(--colors-on-dark)' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Rejected Today</div>
                <div className="stat-value" data-testid="stat-rejected-today">{stats.rejectedToday}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-pink)', color: '#ffffff' }}>
                <XCircle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Pending Amount</div>
                <div className="stat-value" data-testid="stat-total-pending-amount">
                  ₹{Number(stats.totalPendingAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-ochre)', color: 'var(--colors-ink)' }}>
                <IndianRupee size={22} />
              </div>
            </div>

            <div
              className="stat-card"
              onClick={() => setCurrentView({ view: 'vouchers', filterStatus: null })}
              style={{ cursor: 'pointer' }}
              title="Click to view all organization vouchers"
            >
              <div>
                <div className="stat-label">Total Vouchers in System</div>
                <div className="stat-value" data-testid="stat-director-total">{stats.totalVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-lavender)', color: '#4a154b' }}>
                <Layers size={22} />
              </div>
            </div>
          </div>

          {/* Director Review & Approvals Queue (with distinct Pending vs All Approvals switcher) */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: directorQueueTab === 'pending' ? 'var(--colors-brand-peach)' : 'var(--colors-brand-teal)'
                }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    {directorQueueTab === 'pending' ? 'Pending Approval Review Queue' : 'All Approved Vouchers (Archive)'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--colors-muted)' }}>
                    {directorQueueTab === 'pending'
                      ? 'Action required: Review and provide signature'
                      : 'Authorized vouchers with employee and director signatures'}
                  </p>
                </div>
              </div>

              {/* Segmented Queue Switcher + View All Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  background: 'var(--colors-surface-card)',
                  padding: '3px',
                  borderRadius: 'var(--rounded-full)',
                  border: '1px solid var(--colors-hairline)'
                }}>
                  <button
                    type="button"
                    onClick={() => setDirectorQueueTab('pending')}
                    data-testid="director-tab-pending"
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: directorQueueTab === 'pending' ? 600 : 500,
                      borderRadius: 'var(--rounded-full)',
                      border: 'none',
                      cursor: 'pointer',
                      background: directorQueueTab === 'pending' ? 'var(--colors-primary)' : 'transparent',
                      color: directorQueueTab === 'pending' ? 'var(--colors-on-primary)' : 'var(--colors-muted)'
                    }}
                  >
                    Pending Approvals ({stats.pendingApprovalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectorQueueTab('approved')}
                    data-testid="director-tab-approved"
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: directorQueueTab === 'approved' ? 600 : 500,
                      borderRadius: 'var(--rounded-full)',
                      border: 'none',
                      cursor: 'pointer',
                      background: directorQueueTab === 'approved' ? 'var(--colors-primary)' : 'transparent',
                      color: directorQueueTab === 'approved' ? 'var(--colors-on-primary)' : 'var(--colors-muted)'
                    }}
                  >
                    All Approvals ({stats.totalApprovedCount || stats.approvedVouchers?.length || 0})
                  </button>
                </div>

                {directorQueueTab === 'pending' ? (
                  <button
                    onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Pending Approval' })}
                    className="btn btn-sm btn-secondary"
                    data-testid="director-view-all-pending-btn"
                  >
                    View All Pending ({stats.pendingApprovalCount}) <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Approved' })}
                    className="btn btn-sm btn-secondary"
                    data-testid="director-view-all-approved-btn"
                  >
                    View All Approved ({stats.totalApprovedCount || 0}) <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {directorQueueTab === 'pending' ? (
              stats.pendingVouchers && stats.pendingVouchers.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Voucher #</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Expense Title</th>
                        <th>Amount</th>
                        <th>Submitted Date</th>
                        <th>Review Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.pendingVouchers.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.voucher_number}</td>
                          <td><strong>{v.employee_name}</strong></td>
                          <td>{v.department_name}</td>
                          <td style={{ fontWeight: 500, color: 'var(--colors-ink)' }}>{v.expense_title}</td>
                          <td style={{ fontWeight: 700, color: 'var(--colors-ink)' }}>
                            ₹{Number(v.amount).toLocaleString('en-IN')}
                          </td>
                          <td>{v.voucher_date}</td>
                          <td>
                            <button
                              onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                              className="btn btn-sm btn-primary"
                              data-testid={`director-review-btn-${v.id}`}
                            >
                              Review & Decide
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--colors-muted)' }}>
                  🎉 No pending vouchers awaiting approval at this time.
                </div>
              )
            ) : (
              stats.approvedVouchers && stats.approvedVouchers.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Voucher #</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Expense Title</th>
                        <th>Amount</th>
                        <th>Approval Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.approvedVouchers.map((v) => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.voucher_number}</td>
                          <td><strong>{v.employee_name}</strong></td>
                          <td>{v.department_name}</td>
                          <td style={{ fontWeight: 500, color: 'var(--colors-ink)' }}>{v.expense_title}</td>
                          <td style={{ fontWeight: 700, color: 'var(--colors-ink)' }}>
                            ₹{Number(v.amount).toLocaleString('en-IN')}
                          </td>
                          <td>{v.approval_date}</td>
                          <td><StatusBadge status={v.status} /></td>
                          <td>
                            <button
                              onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                              className="btn btn-sm btn-secondary"
                              data-testid={`director-view-approved-btn-${v.id}`}
                            >
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--colors-muted)' }}>
                  No approved vouchers yet.
                </div>
              )
            )}
          </div>

          {/* Recent Voucher Activity (Audit Logs) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Activity size={18} color="var(--colors-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Recent Voucher Activity</h3>
            </div>

            {stats.recentVoucherActivity && stats.recentVoucherActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {stats.recentVoucherActivity.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--colors-surface-soft)',
                      borderRadius: 'var(--rounded-md)',
                      border: '1px solid var(--colors-hairline)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${
                        log.action === 'APPROVED' ? 'badge-approved' :
                        log.action === 'REJECTED' ? 'badge-rejected' :
                        log.action === 'SUBMITTED' ? 'badge-pending' : 'badge-draft'
                      }`}>
                        {log.action}
                      </span>
                      <div>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', marginRight: '0.5rem', color: 'var(--colors-ink)' }}>
                          {log.voucher_number}
                        </span>
                        <span style={{ color: 'var(--colors-body)', fontSize: '0.85rem' }}>
                          {log.details}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted)' }}>
                      by <strong>{log.performed_by_name}</strong> • {log.created_at}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', color: 'var(--colors-muted)' }}>No recent activity.</div>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. ACCOUNTS TEAM DASHBOARD (Section 8 of PDF) */}
      {/* ======================================================== */}
      {user.role === 'accounts' && stats && (
        <>
          <div className="stat-grid" data-testid="accounts-stat-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Vouchers</div>
                <div className="stat-value" data-testid="stat-accounts-total">{stats.totalVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-teal)', color: 'var(--colors-on-dark)' }}>
                <Layers size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Pending Approval</div>
                <div className="stat-value" data-testid="stat-accounts-pending">{stats.pendingApproval}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-peach)', color: 'var(--colors-ink)' }}>
                <Clock size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Approved Vouchers</div>
                <div className="stat-value" data-testid="stat-accounts-approved">{stats.approvedVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-mint)', color: '#0f4c3a' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Rejected Vouchers</div>
                <div className="stat-value" data-testid="stat-accounts-rejected">{stats.rejectedVouchers}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-pink)', color: '#ffffff' }}>
                <XCircle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Total Approved Expense Amount</div>
                <div className="stat-value" data-testid="stat-accounts-approved-amount">
                  ₹{Number(stats.totalApprovedExpenseAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--colors-brand-lavender)', color: '#4a154b' }}>
                <IndianRupee size={22} />
              </div>
            </div>
          </div>

          {/* Recent Approved Vouchers ready for reimbursement */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Recent Approved Vouchers (Ready for Reimbursement)</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--colors-muted)' }}>
                  Vouchers authorized with employee and director signatures ready for payment processing
                </p>
              </div>
              <button
                onClick={() => setCurrentView({ view: 'vouchers', filterStatus: 'Approved' })}
                className="btn btn-sm btn-secondary"
              >
                View All Approved <ArrowRight size={14} />
              </button>
            </div>

            {stats.recentApprovedVouchers && stats.recentApprovedVouchers.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Voucher #</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Expense Title</th>
                      <th>Amount</th>
                      <th>Approved Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApprovedVouchers.map((v) => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.voucher_number}</td>
                        <td style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>{v.employee_name}</td>
                        <td>{v.department_name}</td>
                        <td style={{ fontWeight: 500 }}>{v.expense_title}</td>
                        <td style={{ fontWeight: 700, color: 'var(--colors-ink)' }}>
                          ₹{Number(v.amount).toLocaleString('en-IN')}
                        </td>
                        <td>{v.approval_date}</td>
                        <td>
                          <button
                            onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                            className="btn btn-sm btn-secondary"
                            data-testid={`accounts-view-btn-${v.id}`}
                          >
                            <Eye size={13} /> View & Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--colors-muted)' }}>
                No approved vouchers processed yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
