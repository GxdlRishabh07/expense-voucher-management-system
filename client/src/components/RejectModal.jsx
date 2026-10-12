import React, { useState } from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';

export function RejectModal({ voucher, isOpen, onClose, onConfirm, loading }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason || !rejectionReason.trim()) {
      setError('Rejection Reason is mandatory if a voucher is rejected.');
      return;
    }
    setError(null);
    onConfirm(voucher.id, rejectionReason.trim());
  };

  return (
    <div className="modal-overlay" data-testid="reject-modal-overlay">
      <div className="modal-content" data-testid="reject-modal">
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--colors-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#fff5f7', color: 'var(--colors-brand-pink)', padding: '6px', borderRadius: 'var(--rounded-sm)' }}>
              <XCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--colors-ink)' }}>Reject Expense Voucher</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--colors-muted)' }}>
                {voucher.voucher_number} • ₹{Number(voucher.amount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-outline" style={{ border: 'none', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem', background: 'var(--colors-surface-soft)', padding: '1rem', borderRadius: 'var(--rounded-md)', border: '1px solid var(--colors-hairline)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--colors-ink)' }}>{voucher.expense_title}</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--colors-muted)', marginTop: '0.25rem' }}>
              Submitted by <strong>{voucher.employee_name}</strong> ({voucher.department_name})
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff5f7', border: '1px solid #fed7e2', borderRadius: 'var(--rounded-md)', color: '#9b1c4b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid="reject-modal-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Mandatory Rejection Reason */}
          <div className="form-group">
            <label className="form-label" htmlFor="rejection-reason">
              Rejection Remarks / Reason <span className="required">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              className={`form-textarea ${error ? 'error' : ''}`}
              placeholder="Specify clear remarks explaining why this voucher is being rejected (e.g. missing receipts, incorrect department, policy limit exceeded)..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (error) setError(null);
              }}
              data-testid="rejection-reason-textarea"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--colors-muted)', marginTop: '0.35rem' }}>
              The employee will be able to review this rejection reason directly on their voucher view.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading || !rejectionReason.trim()}
              data-testid="confirm-reject-btn"
            >
              <XCircle size={16} />
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
