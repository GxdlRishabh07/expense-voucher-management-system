import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import {
  Eye, Edit3, Trash2, PlusCircle, CheckCircle2, XCircle, Printer,
  FileSpreadsheet, Download, RefreshCw
} from 'lucide-react';

export function VouchersListPage({ setCurrentView, initialStatus = null }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    search: '',
    voucher_number: '',
    employee_name: '',
    department: '',
    category: '',
    status: initialStatus || '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  };

  const [filters, setFilters] = useState(initialFilters);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });

      const res = await api.get(`/vouchers?${queryParams.toString()}`);
      if (res.success) {
        setVouchers(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load vouchers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters, user?.id]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      status: initialStatus || ''
    }));
  }, [initialStatus]);

  const handleResetFilters = () => {
    setFilters({
      ...initialFilters,
      status: initialStatus || ''
    });
  };

  const handleDeleteDraft = async (id, voucherNumber) => {
    if (!window.confirm(`Are you sure you want to delete Draft voucher ${voucherNumber}?`)) {
      return;
    }

    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (res.success) {
        showToast(res.message, 'success');
        fetchVouchers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete draft', 'error');
    }
  };

  return (
    <div data-testid="vouchers-list-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, margin: 0, color: 'var(--colors-ink)', letterSpacing: '-0.8px' }}>
            {user.role === 'employee'
              ? 'My Expense Vouchers'
              : initialStatus === 'Pending Approval'
              ? 'Pending Approval Requests'
              : initialStatus === 'Approved'
              ? 'All Approved Vouchers'
              : 'All Organization Vouchers'}
          </h1>
          <p style={{ color: 'var(--colors-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {user.role === 'employee'
              ? 'Showing only vouchers created by yourself'
              : initialStatus === 'Pending Approval'
              ? `Vouchers awaiting review and approval (${vouchers.length} records)`
              : initialStatus === 'Approved'
              ? `Vouchers successfully authorized with signatures (${vouchers.length} records)`
              : `Centralized repository of all vouchers across departments (${vouchers.length} records)`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchVouchers}
            className="btn btn-secondary"
            title="Refresh Table"
            data-testid="refresh-vouchers-btn"
          >
            <RefreshCw size={15} /> Refresh
          </button>

          {user.role === 'employee' && (
            <button
              onClick={() => setCurrentView({ view: 'create' })}
              className="btn btn-primary"
              data-testid="list-create-btn"
            >
              <PlusCircle size={16} /> Create Voucher
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar (Bonus Point) */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        showEmployeeFilter={user.role !== 'employee'}
      />

      {/* Vouchers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--colors-muted)' }}>
            Loading expense vouchers...
          </div>
        ) : vouchers.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table" data-testid="vouchers-table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  {user.role !== 'employee' && <th>Employee</th>}
                  <th>Department</th>
                  <th>Expense Title</th>
                  <th>Category</th>
                  <th>Expense Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Signatures</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} data-testid={`voucher-row-${v.id}`}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {v.voucher_number}
                    </td>

                    {user.role !== 'employee' && (
                      <td>
                        <strong style={{ color: 'var(--colors-ink)' }}>{v.employee_name}</strong>
                        {v.employee_code && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--colors-muted)' }}>
                            {v.employee_code}
                          </div>
                        )}
                      </td>
                    )}

                    <td>{v.department_name}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>{v.expense_title}</div>
                      {v.expense_description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.expense_description}
                        </div>
                      )}
                    </td>
                    <td>{v.expense_category}</td>
                    <td>{v.expense_date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--colors-ink)' }}>
                      ₹{Number(v.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Signature Status indicator */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span
                          title={v.employee_signature_url ? 'Employee signature attached' : 'No employee signature'}
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 'var(--rounded-pill)',
                            background: v.employee_signature_url ? '#e6f7f2' : 'var(--colors-surface-card)',
                            color: v.employee_signature_url ? '#047857' : 'var(--colors-muted)',
                            border: `1px solid ${v.employee_signature_url ? 'var(--colors-brand-mint)' : 'var(--colors-hairline)'}`
                          }}
                        >
                          EMP {v.employee_signature_url ? '✓' : '—'}
                        </span>
                        <span
                          title={v.director_signature_url ? 'Director signature attached' : 'No director signature'}
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 'var(--rounded-pill)',
                            background: v.director_signature_url ? '#e6f7f2' : 'var(--colors-surface-card)',
                            color: v.director_signature_url ? '#047857' : 'var(--colors-muted)',
                            border: `1px solid ${v.director_signature_url ? 'var(--colors-brand-mint)' : 'var(--colors-hairline)'}`
                          }}
                        >
                          DIR {v.director_signature_url ? '✓' : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Actions based on role and status */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                          className="btn btn-sm btn-secondary"
                          title="View Details"
                          data-testid={`view-action-${v.id}`}
                        >
                          <Eye size={13} /> View
                        </button>

                        {/* Employee Draft Edit & Delete */}
                        {user.role === 'employee' && v.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => setCurrentView({ view: 'edit', voucherId: v.id })}
                              className="btn btn-sm btn-outline"
                              title="Edit Draft"
                              data-testid={`edit-action-${v.id}`}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteDraft(v.id, v.voucher_number)}
                              className="btn btn-sm btn-outline"
                              style={{ color: 'var(--colors-brand-pink)', borderColor: '#fecdd3' }}
                              title="Delete Draft"
                              data-testid={`delete-action-${v.id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        {/* Director Quick Review */}
                        {user.role === 'director' && v.status === 'Pending Approval' && (
                          <button
                            onClick={() => setCurrentView({ view: 'detail', voucherId: v.id })}
                            className="btn btn-sm btn-primary"
                            data-testid={`director-decide-${v.id}`}
                          >
                            Decide
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--colors-ink)' }}>No matching vouchers found</h3>
            <p style={{ color: 'var(--colors-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.25rem' }}>
              Try adjusting your search criteria, clearing active filters, or creating a new voucher.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
