import React from 'react';
import { Printer, CheckCircle, Download, FileText } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

export function VoucherReceipt({ voucher }) {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-voucher card" style={{ padding: '2.5rem', background: '#ffffff', border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-xl)' }} data-testid="voucher-receipt">
      {/* Action Bar (hidden in print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <button onClick={handlePrint} className="btn btn-primary" data-testid="print-voucher-btn">
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Official Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--colors-primary)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--colors-ink)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
            Prachay Securities Private Limited
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--colors-muted)', margin: '4px 0 0' }}>
            Corporate Office • Expense Reimbursement Voucher
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--colors-ink)', fontFamily: 'monospace' }}>
            {voucher.voucher_number}
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            <StatusBadge status={voucher.status} />
          </div>
        </div>
      </div>

      {/* Grid: Voucher & Employee Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.75rem', background: 'var(--colors-surface-soft)', padding: '1.25rem', borderRadius: 'var(--rounded-md)', border: '1px solid var(--colors-hairline)' }}>
        <div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            Basic Information
          </div>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Voucher Date:</strong> {voucher.voucher_date}
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Expense Date:</strong> {voucher.expense_date}
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Department:</strong> {voucher.department_name}
          </p>
        </div>

        <div>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            Employee Information
          </div>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Employee Name:</strong> {voucher.employee_name}
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Employee ID:</strong> {voucher.employee_code || 'EMP-' + voucher.employee_id}
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>
            <strong>Expense Category:</strong> {voucher.expense_category}
          </p>
        </div>
      </div>

      {/* Expense Line Item Table */}
      <div style={{ marginBottom: '1.75rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--colors-hairline)' }}>
          <thead>
            <tr style={{ background: 'var(--colors-primary)', color: 'var(--colors-on-primary)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Expense Title & Particulars</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem', borderBottom: '1px solid var(--colors-hairline)' }}>
                <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>{voucher.expense_title}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--colors-muted)', marginTop: '0.35rem' }}>
                  {voucher.expense_description || 'No additional description provided.'}
                </div>
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid var(--colors-hairline)', color: 'var(--colors-body)' }}>
                {voucher.expense_category}
              </td>
              <td style={{ padding: '1rem', borderBottom: '1px solid var(--colors-hairline)', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: 'var(--colors-ink)' }}>
                ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--colors-surface-soft)' }}>
              <td colSpan={2} style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Total Claimed Amount:</td>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right', fontSize: '1.15rem', color: 'var(--colors-ink)' }}>
                ₹{Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rejection Remarks (if rejected) */}
      {voucher.status === 'Rejected' && voucher.rejection_reason && (
        <div style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem', background: '#fff5f7', border: '1px solid #fed7e2', borderRadius: 'var(--rounded-md)' }}>
          <div style={{ fontWeight: 600, color: '#9b1c4b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            Director Rejection Remarks:
          </div>
          <div style={{ color: '#9b1c4b', fontSize: '0.875rem' }}>
            {voucher.rejection_reason}
          </div>
        </div>
      )}

      {/* Signatures & Approvals Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '2rem', borderTop: '1px dashed var(--colors-hairline)', paddingTop: '1.5rem' }}>
        {/* Employee Signature */}
        <div style={{ border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-md)', padding: '1rem', textAlign: 'center', background: '#ffffff' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            Employee Signature
          </div>
          <div style={{ minHeight: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {voucher.employee_signature_url ? (
              <img
                src={voucher.employee_signature_url}
                alt="Employee Signature"
                style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain' }}
                data-testid="receipt-employee-signature"
              />
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--colors-muted-soft)', fontStyle: 'italic' }}>
                Signature pending submission
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--colors-ink)', borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            {voucher.employee_name}
          </div>
        </div>

        {/* Director Signature & Stamp */}
        <div style={{ border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-md)', padding: '1rem', textAlign: 'center', background: '#ffffff' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--colors-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            Director Approval & Signature
          </div>
          <div style={{ minHeight: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {voucher.director_signature_url ? (
              <img
                src={voucher.director_signature_url}
                alt="Director Signature"
                style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain' }}
                data-testid="receipt-director-signature"
              />
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--colors-muted-soft)', fontStyle: 'italic' }}>
                {voucher.status === 'Approved' ? 'Authorized by Director' : 'Pending Director review'}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--colors-ink)', borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            {voucher.director_name || 'Executive Director'}
            {voucher.approval_date && (
              <div style={{ fontSize: '0.725rem', color: '#047857', fontWeight: 500 }}>
                Approved on: {voucher.approval_date}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.725rem', color: 'var(--colors-muted)', borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '1rem' }}>
        This document is an electronic expense reimbursement record generated by the Prachay Securities Expense Voucher Management System.
      </div>
    </div>
  );
}
