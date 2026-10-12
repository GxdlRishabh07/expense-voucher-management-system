import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { SignaturePad } from '../components/SignaturePad.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ArrowLeft, Save, Send, AlertTriangle, Trash2 } from 'lucide-react';

export function VoucherEditPage({ voucherId, setCurrentView }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    expense_date: '',
    department_name: '',
    expense_title: '',
    expense_category: '',
    expense_description: '',
    amount: '',
    employee_signature_url: null
  });

  const departments = ['Engineering', 'Marketing', 'Executive', 'Finance', 'Human Resources', 'Operations', 'Sales'];
  const categories = ['Travel', 'Meals & Entertainment', 'Client Entertainment', 'Office Supplies', 'Software & IT', 'Utilities', 'Miscellaneous'];

  useEffect(() => {
    async function loadVoucher() {
      try {
        setLoading(true);
        const res = await api.get(`/vouchers/${voucherId}`);
        if (res.success && res.data) {
          setVoucher(res.data);
          setFormData({
            expense_date: res.data.expense_date,
            department_name: res.data.department_name,
            expense_title: res.data.expense_title,
            expense_category: res.data.expense_category,
            expense_description: res.data.expense_description || '',
            amount: res.data.amount,
            employee_signature_url: res.data.employee_signature_url
          });
        }
      } catch (err) {
        showToast(err.message || 'Failed to load voucher', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (voucherId) {
      loadVoucher();
    }
  }, [voucherId]);

  const validate = (action) => {
    const errs = {};
    if (!formData.department_name?.trim()) errs.department_name = 'Department is mandatory.';
    if (!formData.expense_title?.trim()) errs.expense_title = 'Expense Title is mandatory.';
    if (!formData.expense_date) errs.expense_date = 'Expense Date is mandatory.';
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      errs.amount = 'Amount is mandatory and must be greater than zero.';
    }

    if (action === 'submit' && (!formData.employee_signature_url || !formData.employee_signature_url.trim())) {
      errs.employee_signature_url = 'Employee Signature is mandatory before submission.';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async (action) => {
    if (!validate(action)) {
      showToast('Please fix validation errors before saving.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        action // 'save_draft' or 'submit'
      };

      const res = await api.put(`/vouchers/${voucherId}`, payload);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentView({ view: 'detail', voucherId });
      }
    } catch (err) {
      showToast(err.message || 'Failed to update voucher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete Draft voucher ${voucher.voucher_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.delete(`/vouchers/${voucherId}`);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentView({ view: 'vouchers' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete voucher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading draft voucher...</div>;
  }

  if (!voucher) {
    return <div style={{ padding: '2rem', color: '#ef4444' }}>Voucher not found.</div>;
  }

  const isEditable = voucher.status === 'Draft' && voucher.employee_id === user.id;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} data-testid="voucher-edit-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setCurrentView({ view: 'detail', voucherId })}
          className="btn btn-secondary"
          data-testid="edit-back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 500, margin: 0, color: 'var(--colors-ink)', letterSpacing: '-0.6px' }}>
            Edit Draft: {voucher.voucher_number}
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '0.825rem', color: 'var(--colors-muted)' }}>
            Voucher Date: {voucher.voucher_date}
          </p>
        </div>
        <div>
          {isEditable && (
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-outline"
              style={{ color: 'var(--colors-brand-pink)', borderColor: '#fecdd3' }}
              disabled={submitting}
              data-testid="edit-delete-draft-btn"
            >
              <Trash2 size={14} /> Delete Draft
            </button>
          )}
        </div>
      </div>

      {!isEditable && (
        <div style={{ background: '#fff5f7', border: '1px solid #fed7e2', borderRadius: 'var(--rounded-md)', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle color="var(--colors-brand-pink)" size={24} />
          <div>
            <div style={{ fontWeight: 600, color: '#9b1c4b' }}>Voucher is Read-Only</div>
            <div style={{ fontSize: '0.85rem', color: '#9b1c4b' }}>
              According to business rules, vouchers can only be modified while in <strong>Draft</strong> status. This voucher is currently <strong>{voucher.status}</strong>.
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-department">
                Department Name <span className="required">*</span>
              </label>
              <select
                id="edit-department"
                disabled={!isEditable}
                className="form-select"
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                data-testid="edit-department-select"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-expense-date">
                Expense Date <span className="required">*</span>
              </label>
              <input
                id="edit-expense-date"
                type="date"
                disabled={!isEditable}
                className="form-input"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                data-testid="edit-expense-date-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-category">
                Expense Category <span className="required">*</span>
              </label>
              <select
                id="edit-category"
                disabled={!isEditable}
                className="form-select"
                value={formData.expense_category}
                onChange={(e) => setFormData({ ...formData, expense_category: e.target.value })}
                data-testid="edit-category-select"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-amount">
                Amount (INR ₹) <span className="required">*</span>
              </label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                disabled={!isEditable}
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                data-testid="edit-amount-input"
              />
              {validationErrors.amount && (
                <div className="form-error">{validationErrors.amount}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">
              Expense Title <span className="required">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              disabled={!isEditable}
              className="form-input"
              value={formData.expense_title}
              onChange={(e) => setFormData({ ...formData, expense_title: e.target.value })}
              data-testid="edit-title-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">
              Expense Description & Notes
            </label>
            <textarea
              id="edit-description"
              rows={3}
              disabled={!isEditable}
              className="form-textarea"
              value={formData.expense_description}
              onChange={(e) => setFormData({ ...formData, expense_description: e.target.value })}
              data-testid="edit-description-textarea"
            />
          </div>

          {isEditable && (
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>Employee Signature</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--colors-muted)', marginBottom: '1.25rem' }}>
                Required before submitting for Director approval.
              </p>

              <SignaturePad
                value={formData.employee_signature_url}
                onChange={(url) => setFormData({ ...formData, employee_signature_url: url })}
                label="Signature"
                required={false}
                testIdPrefix="edit-employee"
              />

              {validationErrors.employee_signature_url && (
                <div className="form-error" style={{ marginTop: '0.5rem' }}>
                  {validationErrors.employee_signature_url}
                </div>
              )}
            </div>
          )}

          {isEditable && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.25rem', borderTop: '1px solid var(--colors-hairline)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => handleUpdate('save_draft')}
                className="btn btn-secondary"
                disabled={submitting}
                data-testid="edit-save-draft-btn"
              >
                <Save size={16} /> Save Changes
              </button>

              <button
                type="button"
                onClick={() => handleUpdate('submit')}
                className="btn btn-primary"
                disabled={submitting}
                data-testid="edit-submit-btn"
              >
                <Send size={16} /> Submit for Approval
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
