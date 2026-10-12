-- ============================================================
-- EXPENSE VOUCHER MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Compatible with SQLite (and standard PostgreSQL / MySQL)
-- ============================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('employee', 'director', 'accounts')),
    department TEXT NOT NULL,
    employee_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    voucher_date TEXT NOT NULL,
    expense_date TEXT NOT NULL,
    department_name TEXT NOT NULL,
    expense_title TEXT NOT NULL,
    expense_category TEXT NOT NULL,
    expense_description TEXT,
    amount REAL NOT NULL CHECK(amount > 0),
    
    -- Employee Information
    employee_id INTEGER NOT NULL,
    employee_name TEXT NOT NULL,
    employee_code TEXT,
    employee_signature_url TEXT,
    
    -- Approval Information
    status TEXT NOT NULL CHECK(status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')) DEFAULT 'Draft',
    director_id INTEGER,
    director_name TEXT,
    director_signature_url TEXT,
    approval_date TEXT,
    rejection_reason TEXT,
    
    -- Audit Information
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    performed_by_id INTEGER NOT NULL,
    performed_by_name TEXT NOT NULL,
    performed_by_role TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Indices for rapid search and filtering
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department_name);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_vouchers_dates ON vouchers(expense_date, voucher_date);
CREATE INDEX IF NOT EXISTS idx_audit_voucher_id ON audit_logs(voucher_id);
