import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { VoucherReceipt } from '../components/VoucherReceipt.jsx';
import { ApproveModal } from '../components/ApproveModal.jsx';
import { RejectModal } from '../components/RejectModal.jsx';
import {
  ArrowLeft, Edit3, Trash2, Send, CheckCircle2, XCircle, Printer,
  Clock, Calendar, User, Building, FileText, IndianRupee, ShieldCheck
} from 'lucide-react';

export function VoucherDetailPage({ voucherId, setCurrentView }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReceiptView, setShowReceiptView] = useState(false);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vouchers/${voucherId}`);
      if (res.success && res.data) {
        setVoucher(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load voucher details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (voucherId) {
      fetchVoucher();
    }
  }, [voucherId]);

  // Director: Approve
  const handleApprove = async (id, signatureUrl) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/vouchers/${id}/approve`, {
        director_signature_url: signatureUrl
      });
      if (res.success) {
        showToast(res.message, 'success');
        setIsApproveOpen(false);
        fetchVoucher();
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve voucher', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Director: Reject
  const handleReject = async (id, reason) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/vouchers/${id}/reject`, {
        rejection_reason: reason
      });
      if (res.success) {
        showToast(res.message, 'success');
        setIsRejectOpen(false);
        fetchVoucher();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject voucher', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Employee: Delete Draft
  const handleDeleteDraft = async () => {
    if (!window.confirm(`Are you sure you want to delete Draft voucher ${voucher.voucher_number}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.delete(`/vouchers/${voucher.id}`);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentView({ view: 'vouchers' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete voucher', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading voucher details...</div>;
  }

  if (!voucher) {
    return <div style={{ padding: '2rem', color: '#ef4444' }}>Voucher not found or access denied.</div>;
  }

  const isEmployeeOwner = user.role === 'employee' && voucher.employee_id === user.id;
  const isDirector = user.role === 'director';
  const isPending = voucher.status === 'Pending Approval';
  const isDraft = voucher.status === 'Draft';

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto' }} data-testid="voucher-detail-page">
      {/* Top Header / Action Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => setCurrentView({ view: 'vouchers' })}
          className="btn btn-secondary"
          data-testid="detail-back-btn"
        >
          <ArrowLeft size={16} /> Back to Vouchers
        </button>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {/* Toggle between Details & Official Receipt Print View */}
          <button
            onClick={() => setShowReceiptView(!showReceiptView)}
            className="btn btn-secondary"
            data-testid="toggle-receipt-btn"
          >
            <Printer size={16} /> {showReceiptView ? 'Show Detailed Specs' : 'Official Printable Receipt'}
          </button>

          {/* Employee Actions on Draft */}
          {isEmployeeOwner && isDraft && (
            <>
              <button
                onClick={() => setCurrentView({ view: 'edit', voucherId: voucher.id })}
                className="btn btn-primary"
                data-testid="detail-edit-draft-btn"
              >
                <Edit3 size={16} /> Edit Draft
              </button>
              <button
                onClick={handleDeleteDraft}
                className="btn btn-danger"
                disabled={actionLoading}
                data-testid="detail-delete-draft-btn"
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}

          {/* Director Approval Actions on Pending Voucher */}
          {isDirector && isPending && (
            <>
              <button
                onClick={() => setIsRejectOpen(true)}
                className="btn btn-danger"
                disabled={actionLoading}
                data-testid="director-reject-action-btn"
              >
                <XCircle size={16} /> Reject Voucher
              </button>
              <button
                onClick={() => setIsApproveOpen(true)}
                className="btn btn-success"
                disabled={actionLoading}
                data-testid="director-approve-action-btn"
              >
                <CheckCircle2 size={16} /> Approve Voucher
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conditionally render Printable Receipt or Tabular Detail View */}
      {showReceiptView ? (
        <VoucherReceipt voucher={voucher} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status & Summary Hero Card */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: 0, fontFamily: 'monospace', color: 'var(--colors-ink)', letterSpacing: '-0.5px' }} data-testid="detail-voucher-number">
                  {voucher.voucher_number}
                </h1>
                <StatusBadge status={voucher.status} />
              </div>
              <p style={{ margin: 0, color: 'var(--colors-muted)', fontSize: '0.9rem' }}>
                {voucher.expense_title}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Claim Amount
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--colors-ink)', letterSpacing: '-0.5px' }} data-testid="detail-amount">
                ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Rejection Alert if rejected */}
          {voucher.status === 'Rejected' && voucher.rejection_reason && (
            <div style={{ background: '#fff5f7', border: '1px solid #fed7e2', borderRadius: 'var(--rounded-lg)', padding: '1.25rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }} data-testid="detail-rejection-banner">
              <XCircle size={22} color="var(--colors-brand-pink)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#9b1c4b', margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 600 }}>
                  Voucher Rejected by Director
                </h4>
                <div style={{ color: '#9b1c4b', fontSize: '0.9rem', lineHeight: 1.5 }} data-testid="detail-rejection-reason">
                  {voucher.rejection_reason}
                </div>
              </div>
            </div>
          )}

          {/* Approval Stamp if approved */}
          {voucher.status === 'Approved' && (
            <div style={{ background: '#e6f7f2', border: '1px solid var(--colors-brand-mint)', borderRadius: 'var(--rounded-lg)', padding: '1.25rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }} data-testid="detail-approved-banner">
              <CheckCircle2 size={22} color="#047857" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: '#047857', margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 600 }}>
                  Voucher Approved & Authorized
                </h4>
                <div style={{ color: '#047857', fontSize: '0.85rem' }}>
                  Approved by <strong>{voucher.director_name}</strong> on {voucher.approval_date}. Visible to Accounts Team for payment processing.
                </div>
              </div>
            </div>
          )}

          {/* Main Info Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* 1. Basic Expense Information */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--colors-ink)" /> Expense Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--colors-muted)' }}>Department:</span>
                  <strong style={{ color: 'var(--colors-ink)' }}>{voucher.department_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--colors-muted)' }}>Expense Category:</span>
                  <strong style={{ color: 'var(--colors-ink)' }}>{voucher.expense_category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--colors-muted)' }}>Expense Date:</span>
                  <strong style={{ color: 'var(--colors-ink)' }}>{voucher.expense_date}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--colors-muted)' }}>Voucher Date:</span>
                  <strong style={{ color: 'var(--colors-ink)' }}>{voucher.voucher_date}</strong>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ color: 'var(--colors-muted)', marginBottom: '0.35rem' }}>Description:</div>
                  <div style={{ background: 'var(--colors-surface-soft)', padding: '0.85rem', borderRadius: 'var(--rounded-md)', border: '1px solid var(--colors-hairline)', color: 'var(--colors-body)', minHeight: '60px' }}>
                    {voucher.expense_description || 'No description entered.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Employee & Signatures */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--colors-ink)" /> Signatures & Verification
              </h3>

              {/* Employee info */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Employee
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--colors-ink)' }}>
                  {voucher.employee_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--colors-muted)' }}>
                  ID: {voucher.employee_code || 'EMP-' + voucher.employee_id}
                </div>

                {/* Employee Signature Image */}
                <div style={{ marginTop: '0.65rem', border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-md)', padding: '0.75rem', background: 'var(--colors-surface-soft)', textAlign: 'center' }}>
                  {voucher.employee_signature_url ? (
                    <img
                      src={voucher.employee_signature_url}
                      alt="Employee Signature"
                      style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }}
                      data-testid="detail-employee-sig-img"
                    />
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted-soft)', padding: '0.5rem' }}>
                      No signature attached (Draft)
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--colors-muted)', marginTop: '4px' }}>
                    Employee Signature
                  </div>
                </div>
              </div>

              {/* Director info */}
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Director Review
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--colors-ink)' }}>
                  {voucher.director_name || 'Pending Review'}
                </div>

                {/* Director Signature Image */}
                <div style={{ marginTop: '0.65rem', border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-md)', padding: '0.75rem', background: 'var(--colors-surface-soft)', textAlign: 'center' }}>
                  {voucher.director_signature_url ? (
                    <img
                      src={voucher.director_signature_url}
                      alt="Director Signature"
                      style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }}
                      data-testid="detail-director-sig-img"
                    />
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted-soft)', padding: '0.5rem' }}>
                      {voucher.status === 'Approved' ? 'Authorized' : 'Awaiting Director decision'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--colors-muted)', marginTop: '4px' }}>
                    Director Signature
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Audit History Log (Audit Information) */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--colors-hairline-soft)', paddingBottom: '0.6rem' }}>
              Audit & Lifecycle History
            </h3>

            {voucher.audit_logs && voucher.audit_logs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {voucher.audit_logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--colors-surface-soft)',
                      borderRadius: 'var(--rounded-md)',
                      border: '1px solid var(--colors-hairline)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${
                        log.action === 'APPROVED' ? 'badge-approved' :
                        log.action === 'REJECTED' ? 'badge-rejected' :
                        log.action === 'SUBMITTED' ? 'badge-pending' : 'badge-draft'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                      <span style={{ color: 'var(--colors-body-strong)' }}>{log.details}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--colors-muted)' }}>
                      {log.performed_by_name} ({log.performed_by_role}) • {log.created_at}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--colors-muted)' }}>No audit entries available.</div>
            )}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <ApproveModal
        voucher={voucher}
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <RejectModal
        voucher={voucher}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}
