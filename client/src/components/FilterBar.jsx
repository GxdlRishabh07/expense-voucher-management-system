import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

export function FilterBar({ filters, onFilterChange, onReset, showEmployeeFilter = true }) {
  const departments = ['Engineering', 'Marketing', 'Executive', 'Finance', 'Human Resources', 'Operations', 'Sales'];
  const categories = ['Travel', 'Meals & Entertainment', 'Client Entertainment', 'Office Supplies', 'Software & IT', 'Utilities', 'Miscellaneous'];
  const statuses = ['Draft', 'Pending Approval', 'Approved', 'Rejected'];

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem', background: '#ffffff', borderRadius: 'var(--rounded-xl)' }} data-testid="filter-bar">
      {/* Top Search & Primary Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
        {/* Global Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search voucher#, title, dept..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            data-testid="filter-search-input"
          />
        </div>

        {/* Voucher Number Specific */}
        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Voucher No. (e.g. EV-...)"
            value={filters.voucher_number || ''}
            onChange={(e) => handleChange('voucher_number', e.target.value)}
            data-testid="filter-voucher-number-input"
          />
        </div>

        {/* Employee Name (for Director & Accounts) */}
        {showEmployeeFilter && (
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Employee Name..."
              value={filters.employee_name || ''}
              onChange={(e) => handleChange('employee_name', e.target.value)}
              data-testid="filter-employee-name-input"
            />
          </div>
        )}

        {/* Department Select */}
        <div>
          <select
            className="form-select"
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            data-testid="filter-department-select"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Expense Category Select */}
        <div>
          <select
            className="form-select"
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            data-testid="filter-category-select"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            className="form-select"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            data-testid="filter-status-select"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range, Amount Range & Sorting */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid var(--colors-hairline-soft)' }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date From</label>
          <input
            type="date"
            className="form-input"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            data-testid="filter-start-date"
          />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date To</label>
          <input
            type="date"
            className="form-input"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            data-testid="filter-end-date"
          />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Min Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            value={filters.minAmount || ''}
            onChange={(e) => handleChange('minAmount', e.target.value)}
            data-testid="filter-min-amount"
          />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Max Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="100000"
            value={filters.maxAmount || ''}
            onChange={(e) => handleChange('maxAmount', e.target.value)}
            data-testid="filter-max-amount"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Sort By</label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <select
              className="form-select"
              value={filters.sortBy || 'created_at'}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              data-testid="filter-sort-by"
            >
              <option value="created_at">Date Created</option>
              <option value="amount">Amount</option>
              <option value="expense_date">Expense Date</option>
              <option value="voucher_number">Voucher #</option>
              <option value="status">Status</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleChange('sortOrder', filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              title="Toggle Sort Order"
              data-testid="filter-sort-order-toggle"
              style={{ minHeight: '44px', width: '44px', padding: 0 }}
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>

        {/* Reset button */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary"
            style={{ width: '100%', height: '44px' }}
            data-testid="filter-reset-btn"
          >
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
