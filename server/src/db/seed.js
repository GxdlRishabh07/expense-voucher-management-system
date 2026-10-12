import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './database.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const empSigPath = path.join(config.uploadDir, 'seed-employee-signature.png');
const dirSigPath = path.join(config.uploadDir, 'seed-director-signature.png');

const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAJYAAAA8CAYAAACE81l+AAAAAXNSR0IArs4c6QAAAX1JREFUeF7t0jENAAAIA7EZ/6Jmggc82gRN8r46HAscAhZrK8ACFlYChpW1ZQtLwMJKwLCytmxhCVhYCRhW1pYtLAELKwHDytqyhSVgYSVgWFlbtrAELKwEDCtryxaWgIWVgGFlbdnCErCwEjCsrC1bWAILq/03158eWP55hV0AFvbl9af/AWm6b3gP744NAAAAAElFTkSuQmCC';
if (!fs.existsSync(empSigPath)) {
  fs.writeFileSync(empSigPath, Buffer.from(samplePngBase64, 'base64'));
}
if (!fs.existsSync(dirSigPath)) {
  fs.writeFileSync(dirSigPath, Buffer.from(samplePngBase64, 'base64'));
}

export function seed() {
  console.log('--- Initializing Database Schema ---');
  initDatabase();

  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Password@123', salt);

  console.log('--- Clearing Vouchers and Audit Logs for Clean State ---');
  db.prepare('DELETE FROM audit_logs').run();
  db.prepare('DELETE FROM vouchers').run();

  console.log('--- Seeding Users ---');
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, department, employee_code)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      password = excluded.password,
      role = excluded.role,
      department = excluded.department,
      employee_code = excluded.employee_code
  `);

  insertUser.run(1, 'Rahul Sharma', 'rahul@prachay.com', defaultPasswordHash, 'employee', 'Engineering', 'EMP101');
  insertUser.run(2, 'Priya Patel', 'priya@prachay.com', defaultPasswordHash, 'employee', 'Marketing', 'EMP102');
  insertUser.run(3, 'Amit Verma (Director)', 'director@prachay.com', defaultPasswordHash, 'director', 'Executive', 'DIR001');
  insertUser.run(4, 'Sneha Rao (Accounts)', 'accounts@prachay.com', defaultPasswordHash, 'accounts', 'Finance', 'ACC001');

  const rahul = db.prepare('SELECT * FROM users WHERE email = ?').get('rahul@prachay.com');
  const priya = db.prepare('SELECT * FROM users WHERE email = ?').get('priya@prachay.com');
  const director = db.prepare('SELECT * FROM users WHERE email = ?').get('director@prachay.com');

  console.log('--- Seeding Initial Vouchers ---');
  const insertVoucher = db.prepare(`
    INSERT INTO vouchers (
      id, voucher_number, voucher_date, expense_date, department_name,
      expense_title, expense_category, expense_description, amount,
      employee_id, employee_name, employee_code, employee_signature_url,
      status, director_id, director_name, director_signature_url,
      approval_date, rejection_reason, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Voucher 1: Approved
  insertVoucher.run(
    1,
    'EV-20261010-0001',
    '2026-10-10',
    '2026-10-08',
    'Engineering',
    'Client Dinner & Technical Architecture Review',
    'Client Entertainment',
    'Dinner with client stakeholders to finalize system technical specifications',
    4500.00,
    rahul.id,
    rahul.name,
    rahul.employee_code,
    '/uploads/signatures/seed-employee-signature.png',
    'Approved',
    director.id,
    director.name,
    '/uploads/signatures/seed-director-signature.png',
    '2026-10-10 16:30:00',
    null,
    '2026-10-10 10:00:00',
    '2026-10-10 16:30:00'
  );
  insertAudit.run(1, 'CREATED_DRAFT', rahul.id, rahul.name, 'employee', 'Draft created');
  insertAudit.run(1, 'SUBMITTED', rahul.id, rahul.name, 'employee', 'Submitted for Director approval');
  insertAudit.run(1, 'APPROVED', director.id, director.name, 'director', 'Approved with signature');

  // Voucher 2: Pending Approval
  insertVoucher.run(
    2,
    'EV-20261011-0002',
    '2026-10-11',
    '2026-10-11',
    'Engineering',
    'Cloud Hosting Server Upgrade & SSL Renewals',
    'Software & IT',
    'Monthly cloud instance scale-up and annual wildcard SSL certificates',
    12800.00,
    rahul.id,
    rahul.name,
    rahul.employee_code,
    '/uploads/signatures/seed-employee-signature.png',
    'Pending Approval',
    null,
    null,
    null,
    null,
    null,
    '2026-10-11 11:15:00',
    '2026-10-11 11:30:00'
  );
  insertAudit.run(2, 'CREATED_DRAFT', rahul.id, rahul.name, 'employee', 'Draft created');
  insertAudit.run(2, 'SUBMITTED', rahul.id, rahul.name, 'employee', 'Submitted for Director approval');

  // Voucher 3: Draft
  insertVoucher.run(
    3,
    'EV-20261011-0003',
    '2026-10-11',
    '2026-10-11',
    'Engineering',
    'Office Stationeries and Notebooks',
    'Office Supplies',
    'Whiteboard markers, sticky pads, notebooks for Q4 planning sprints',
    1250.00,
    rahul.id,
    rahul.name,
    rahul.employee_code,
    null,
    'Draft',
    null,
    null,
    null,
    null,
    null,
    '2026-10-11 14:00:00',
    '2026-10-11 14:00:00'
  );
  insertAudit.run(3, 'CREATED_DRAFT', rahul.id, rahul.name, 'employee', 'Draft created');

  // Voucher 4: Rejected
  insertVoucher.run(
    4,
    'EV-20261009-0004',
    '2026-10-09',
    '2026-10-07',
    'Marketing',
    'Airport Taxi Fare (Urgent Travel)',
    'Travel',
    'Taxi transport between conference venue and hotel during tech summit',
    3200.00,
    priya.id,
    priya.name,
    priya.employee_code,
    '/uploads/signatures/seed-employee-signature.png',
    'Rejected',
    director.id,
    director.name,
    null,
    null,
    'Official taxi invoice or trip receipt is missing. Please attach supporting tax bill and resubmit.',
    '2026-10-09 09:20:00',
    '2026-10-09 15:45:00'
  );
  insertAudit.run(4, 'CREATED_DRAFT', priya.id, priya.name, 'employee', 'Draft created');
  insertAudit.run(4, 'SUBMITTED', priya.id, priya.name, 'employee', 'Submitted for Director approval');
  insertAudit.run(4, 'REJECTED', director.id, director.name, 'director', 'Rejected: Taxi invoice missing');

  // Voucher 5: Approved
  insertVoucher.run(
    5,
    'EV-20261012-0005',
    '2026-10-12',
    '2026-10-12',
    'Marketing',
    'Annual SEO & Marketing Analytics Tool Suite',
    'Software & IT',
    'Subscription renewal for digital market research and content intelligence software',
    18400.00,
    priya.id,
    priya.name,
    priya.employee_code,
    '/uploads/signatures/seed-employee-signature.png',
    'Approved',
    director.id,
    director.name,
    '/uploads/signatures/seed-director-signature.png',
    '2026-10-12 12:10:00',
    null,
    '2026-10-12 10:00:00',
    '2026-10-12 12:10:00'
  );
  insertAudit.run(5, 'CREATED_DRAFT', priya.id, priya.name, 'employee', 'Draft created');
  insertAudit.run(5, 'SUBMITTED', priya.id, priya.name, 'employee', 'Submitted for Director approval');
  insertAudit.run(5, 'APPROVED', director.id, director.name, 'director', 'Approved with signature');

  // Voucher 6: Pending Approval
  insertVoucher.run(
    6,
    'EV-20261012-0006',
    '2026-10-12',
    '2026-10-11',
    'Marketing',
    'Corporate Sponsorship & Exhibition Passes',
    'Client Entertainment',
    'Exhibition stand passes for marketing outreach',
    9500.00,
    priya.id,
    priya.name,
    priya.employee_code,
    '/uploads/signatures/seed-employee-signature.png',
    'Pending Approval',
    null,
    null,
    null,
    null,
    null,
    '2026-10-12 13:00:00',
    '2026-10-12 13:15:00'
  );
  insertAudit.run(6, 'CREATED_DRAFT', priya.id, priya.name, 'employee', 'Draft created');
  insertAudit.run(6, 'SUBMITTED', priya.id, priya.name, 'employee', 'Submitted for Director approval');

  console.log('--- Seed Completed Successfully ---');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
}
