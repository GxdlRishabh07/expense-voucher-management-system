import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { SignaturePad } from './SignaturePad.jsx';

export function ApproveModal({ voucher, isOpen, onClose, onConfirm, loading }) {
  const [directorSignatureUrl, setDirectorSignatureUrl] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!directorSignatureUrl || !directorSignatureUrl.trim()) {
      setError('Director Signature is mandatory before approval.');
      return;
    }
    setError(null);
    onConfirm(voucher.id, directorSignatureUrl);
  };

  return (
    <div className="modal-overlay" data-testid="approve-modal-overlay">
      <div className="modal-content" data-testid="approve-modal">
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--colors-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#e6f7f2', color: '#047857', padding: '6px', borderRadius: 'var(--rounded-sm)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--colors-ink)' }}>Approve Expense Voucher</h3>
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
              Submitted by <strong>{voucher.employee_name}</strong> ({voucher.department_name}) on {voucher.voucher_date}
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff5f7', border: '1px solid #fed7e2', borderRadius: 'var(--rounded-md)', color: '#9b1c4b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid="approve-modal-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Mandatory Director Signature */}
          <SignaturePad
            value={directorSignatureUrl}
            onChange={setDirectorSignatureUrl}
            label="Director Signature (Mandatory for Approval)"
            required={true}
            testIdPrefix="director"
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !directorSignatureUrl}
              data-testid="confirm-approve-btn"
            >
              <CheckCircle size={16} />
              {loading ? 'Approving...' : 'Confirm & Approve Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
