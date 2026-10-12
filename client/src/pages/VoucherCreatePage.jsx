import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { SignaturePad } from '../components/SignaturePad.jsx';
import { ArrowLeft, Save, Send, AlertTriangle, FileText } from 'lucide-react';

export function VoucherCreatePage({ setCurrentView }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    expense_date: todayStr,
    department_name: user?.department || 'Engineering',
    expense_title: '',
    expense_category: 'Travel',
    expense_description: '',
    amount: '',
    employee_signature_url: null
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const departments = ['Engineering', 'Marketing', 'Executive', 'Finance', 'Human Resources', 'Operations', 'Sales'];
  const categories = ['Travel', 'Meals & Entertainment', 'Client Entertainment', 'Office Supplies', 'Software & IT', 'Utilities', 'Miscellaneous'];

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

  const handleSubmit = async (action) => {
    if (!validate(action)) {
      showToast('Please correct the validation errors before proceeding.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        action // 'save_draft' or 'submit'
      };

      const res = await api.post('/vouchers', payload);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentView({ view: 'detail', voucherId: res.data.id });
      }
    } catch (err) {
      showToast(err.message || 'Failed to save voucher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} data-testid="voucher-create-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setCurrentView({ view: 'dashboard' })}
          className="btn btn-secondary"
          data-testid="create-back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 500, margin: 0, color: 'var(--colors-ink)', letterSpacing: '-0.6px' }}>
            Create Expense Voucher
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '0.825rem', color: 'var(--colors-muted)' }}>
            Voucher Number will be generated automatically upon saving
          </p>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      <div className="card">
        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Employee Info Header (Readonly) */}
          <div style={{
            background: 'var(--colors-surface-soft)',
            padding: '1.25rem',
            borderRadius: 'var(--rounded-lg)',
            border: '1px solid var(--colors-surface-strong)',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Employee Information
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--colors-ink)', marginTop: '0.2rem' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--colors-muted)' }}>
                ID: {user?.employee_code || 'EMP001'} • Email: {user?.email}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Initial Status
              </div>
              <span className="badge badge-draft" style={{ marginTop: '0.35rem' }}>
                Draft
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.6rem' }}>
            Expense Particulars
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                Department Name <span className="required">*</span>
              </label>
              <select
                id="department"
                className={`form-select ${validationErrors.department_name ? 'error' : ''}`}
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                data-testid="input-department"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {validationErrors.department_name && (
                <div className="form-error" data-testid="error-department">{validationErrors.department_name}</div>
              )}
            </div>

            {/* Expense Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Expense Date <span className="required">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                className={`form-input ${validationErrors.expense_date ? 'error' : ''}`}
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                data-testid="input-expense-date"
              />
              {validationErrors.expense_date && (
                <div className="form-error" data-testid="error-expense-date">{validationErrors.expense_date}</div>
              )}
            </div>

            {/* Expense Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Expense Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className="form-select"
                value={formData.expense_category}
                onChange={(e) => setFormData({ ...formData, expense_category: e.target.value })}
                data-testid="input-category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount (INR ₹) <span className="required">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`form-input ${validationErrors.amount ? 'error' : ''}`}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                data-testid="input-amount"
              />
              {validationErrors.amount && (
                <div className="form-error" data-testid="error-amount">{validationErrors.amount}</div>
              )}
            </div>
          </div>

          {/* Expense Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-title">
              Expense Title <span className="required">*</span>
            </label>
            <input
              id="expense-title"
              type="text"
              placeholder="e.g. Travel tickets for client onsite visit"
              className={`form-input ${validationErrors.expense_title ? 'error' : ''}`}
              value={formData.expense_title}
              onChange={(e) => setFormData({ ...formData, expense_title: e.target.value })}
              data-testid="input-expense-title"
            />
            {validationErrors.expense_title && (
              <div className="form-error" data-testid="error-expense-title">{validationErrors.expense_title}</div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-description">
              Expense Description & Notes
            </label>
            <textarea
              id="expense-description"
              rows={3}
              placeholder="Provide breakdown of bills, purpose of expenditure, or any relevant details..."
              className="form-textarea"
              value={formData.expense_description}
              onChange={(e) => setFormData({ ...formData, expense_description: e.target.value })}
              data-testid="input-expense-description"
            />
          </div>

          {/* Signature Section */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Employee Signature
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--colors-muted)', marginBottom: '1.25rem' }}>
              Note: Employee Signature is <strong>mandatory</strong> before submission for Director approval (optional while saving as Draft).
            </p>

            <SignaturePad
              value={formData.employee_signature_url}
              onChange={(url) => setFormData({ ...formData, employee_signature_url: url })}
              label="Signature (Draw or Upload Image)"
              required={false}
              testIdPrefix="employee"
            />

            {validationErrors.employee_signature_url && (
              <div className="form-error" style={{ marginTop: '0.5rem' }} data-testid="error-employee-signature">
                {validationErrors.employee_signature_url}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.25rem', borderTop: '1px solid var(--colors-hairline)', paddingTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => handleSubmit('save_draft')}
              className="btn btn-secondary"
              disabled={submitting}
              data-testid="btn-save-draft"
            >
              <Save size={16} /> {submitting ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('submit')}
              className="btn btn-primary"
              disabled={submitting}
              data-testid="btn-submit-voucher"
            >
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
