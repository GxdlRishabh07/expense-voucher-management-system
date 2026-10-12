# Expense Voucher Management System
**Full Stack Developer Internship Assignment — Prachay Securities Private Limited (PSPL)**

A web-based Expense Voucher Management System that digitizes and streamlines the employee voucher creation, multi-level review, approval workflow, and monitoring process. Built with a modern, high-performance architecture using **React (Vite)** on the frontend, **Node.js (Express)** on the backend, **SQLite / SQL** for relational persistence, and verified with **Playwright End-to-End browser testing**.

---

## 🌟 Key Features & Business Workflows

### 1. Role-Based Access Control (RBAC)
- **Employee Portal:**
  - Create new expense reimbursement vouchers with auto-generated unique Voucher Numbers (`EV-YYYYMMDD-XXXX`).
  - Save vouchers as **Draft** (editable and deletable).
  - Submit vouchers for Director approval with **mandatory employee signature** (via file upload or interactive canvas drawing pad).
  - View **only vouchers created by themselves** (strict server-side data isolation).
  - Track current approval status, timeline, and view rejection remarks if rejected.
  - Read-only protection once a voucher is submitted.
- **Director (Admin) Portal:**
  - View all organization vouchers across departments.
  - Dedicated **Pending Approval Review Queue** with real-time counters.
  - Multi-attribute search, filtering, and sorting (by voucher number, employee, department, category, date range, amount range).
  - **Approve Vouchers** with **mandatory Director Signature upload/drawing**.
  - **Reject Vouchers** with **mandatory Rejection Reason remarks** (visible to the employee).
  - Strictly prevented from tampering with the employee's submitted financial details.
- **Accounts Team Portal:**
  - Organization-wide monitoring dashboard with financial aggregate metrics (Total Approved Amount, Pending Amount, etc.).
  - Search, filter, and sort vouchers across departments (Bonus Point).
  - View employee and director signatures, approval stamps, and audit histories.
  - **Download or Print Official Voucher Receipts** with corporate letterhead, breakdown table, and signature authorizations (Bonus Point).
  - Strictly prevented from creating, editing, deleting, approving, or rejecting vouchers.

### 2. Multi-Mode Signature Capture
- **Interactive Canvas Drawing Pad:** Allows drawing signatures directly on screen using a mouse, stylus, or touch device.
- **Image File Upload:** Supports uploading PNG, JPEG, WEBP, and SVG image files with 5MB size limit validation.

### 3. High-Fidelity Dashboards
- **Employee:** Total Vouchers, Draft Vouchers, Pending Approval, Approved, Rejected, Total Amount Claimed, and recent vouchers.
- **Director:** Pending Approval Count, Approved Today, Rejected Today, Total Pending Amount, Total System Vouchers, and Recent Audit Activity.
- **Accounts:** Total Vouchers, Pending Approval, Approved Vouchers, Rejected Vouchers, Total Approved Expense Amount, and Recent Approved Queue.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Modern Vanilla CSS / Design Tokens, HTML5 Canvas API |
| **Backend** | Node.js (v24), Express.js (v4), Multer (file uploads), jsonwebtoken (JWT), bcryptjs |
| **Database** | Relational Database (SQLite via `better-sqlite3` with WAL mode & foreign keys enabled; schema compatible with PostgreSQL / MySQL) |
| **Testing** | Playwright E2E Test Suite (Headed Google Chrome browser automation) |

---

## 📋 Prerequisites

- **Node.js** v18.0.0 or higher (Tested on Node.js v24.11.0)
- **npm** v9.0.0 or higher
- **Google Chrome** browser (for headed Playwright testing)

---

## 🚀 Quick Start & Installation

### Step 1: Install Dependencies
From the project root directory:

```bash
# Install root, backend, frontend, and test dependencies
npm install --prefix server
npm install --prefix client
npm install --prefix tests
```

### Step 2: Seed Demo Users & Sample Vouchers
Populate the database with pre-configured users and realistic vouchers across all lifecycle states:

```bash
npm run seed --prefix server
```

**Pre-seeded Evaluator Demo Accounts:**

| Role | Name | Email | Password | Department | Code |
|---|---|---|---|---|---|
| **Employee** | Rahul Sharma | `rahul@prachay.com` | `Password@123` | Engineering | EMP101 |
| **Employee** | Priya Patel | `priya@prachay.com` | `Password@123` | Marketing | EMP102 |
| **Director (Admin)** | Amit Verma | `director@prachay.com` | `Password@123` | Executive | DIR001 |
| **Accounts Team** | Sneha Rao | `accounts@prachay.com` | `Password@123` | Finance | ACC001 |

> 💡 **Tip:** The application includes a **1-Click Demo Login** on the login page and a **Quick Role Switcher** dropdown in the top navbar, allowing effortless evaluation between roles without re-typing credentials!

### Step 3: Start the Backend API Server
```bash
npm run dev --prefix server
```
*API will run at:* `http://localhost:5001`  
*Health Check:* `http://localhost:5001/api/health`

### Step 4: Start the Frontend Client
In a second terminal:
```bash
npm run dev --prefix client
```
*Frontend will open at:* `http://localhost:5173`

---

## 🧪 Running Automated Playwright Tests

The project includes an end-to-end test suite verifying the complete voucher lifecycle in **strictly headed Google Chrome mode**:

```bash
# Run the complete test suite in headed Chrome
npm run test:headed --prefix tests
```

### Verified Test Suites (11/11 Passed):
1. **`auth.spec.js`**: Role-based authentication, token validation, dashboard metric verification, and navigation guard checks for all three roles.
2. **`employee-workflow.spec.js`**: Form validation rules, Draft creation, editing draft particulars, canvas signature drawing, and submission for Director approval (verifying read-only status after submission).
3. **`director-workflow.spec.js`**: Pending approval queues, Director signature requirement, approval transition with timestamp, rejection requirement with mandatory remarks.
4. **`accounts-and-filter.spec.js`**: Multi-attribute filtering (Department, Status, Search keyword), signature status display, and printable official voucher receipt generation.

---

## 🗄️ Database Schema & Architecture

The database schema is defined in `server/src/db/schema.sql`.

### Tables:

#### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | Full name |
| `email` | TEXT | UNIQUE NOT NULL | Corporate login email |
| `password` | TEXT | NOT NULL | bcryptjs hashed password (10 salt rounds) |
| `role` | TEXT | NOT NULL CHECK IN ('employee', 'director', 'accounts') | User access role |
| `department` | TEXT | NOT NULL | Department name |
| `employee_code` | TEXT | | Employee identifier (e.g. EMP101) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation date |

#### 2. `vouchers`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique voucher ID |
| `voucher_number` | TEXT | UNIQUE NOT NULL | Unique sequential code (`EV-YYYYMMDD-XXXX`) |
| `voucher_date` | TEXT | NOT NULL | Date voucher was initiated |
| `expense_date` | TEXT | NOT NULL | Date expense was incurred |
| `department_name` | TEXT | NOT NULL | Department charged |
| `expense_title` | TEXT | NOT NULL | Title of expense |
| `expense_category` | TEXT | NOT NULL | Category (Travel, Software, etc.) |
| `expense_description`| TEXT | | Description of bills and particulars |
| `amount` | REAL | NOT NULL CHECK (amount > 0) | Monetary claim in INR |
| `employee_id` | INTEGER | FOREIGN KEY REFERENCES users(id) | Creator reference |
| `employee_name` | TEXT | NOT NULL | Creator name snapshot |
| `employee_code` | TEXT | | Employee ID code |
| `employee_signature_url` | TEXT | | Path to uploaded employee signature |
| `status` | TEXT | NOT NULL CHECK IN ('Draft', 'Pending Approval', 'Approved', 'Rejected') | Current workflow status |
| `director_id` | INTEGER | FOREIGN KEY REFERENCES users(id) | Approving director reference |
| `director_name` | TEXT | | Director name snapshot |
| `director_signature_url` | TEXT | | Path to uploaded director signature |
| `approval_date` | TEXT | | Timestamp when voucher was approved |
| `rejection_reason` | TEXT | | Mandatory remarks if voucher was rejected |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last updated timestamp |

#### 3. `audit_logs`
Tracks lifecycle state transitions (`CREATED_DRAFT`, `SUBMITTED`, `UPDATED_DRAFT`, `APPROVED`, `REJECTED`) with timestamps, actor role, and notes.

---

## 📡 RESTful API Documentation

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`: Authenticates user email and password; returns JWT Bearer token and user profile.
- `GET /api/auth/me`: Retrieves current authenticated user profile.
- `GET /api/auth/demo-users`: Returns list of pre-seeded accounts for easy UI testing.

### Voucher Endpoints (`/api/vouchers`)
- `GET /api/vouchers`: Lists vouchers.
  - Employees only receive their self-created vouchers (`WHERE employee_id = ?`).
  - Directors and Accounts receive all vouchers organization-wide.
  - Query parameters supported: `search`, `voucher_number`, `employee_name`, `department`, `category`, `status`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy`, `sortOrder`.
- `GET /api/vouchers/:id`: Retrieves full voucher details and audit logs (protected by employee ownership check).
- `POST /api/vouchers`: Creates a voucher.
  - `action: "save_draft"`: Saves voucher in `Draft` status (signature optional).
  - `action: "submit"`: Validates mandatory employee signature and saves in `Pending Approval` status.
- `PUT /api/vouchers/:id`: Updates an existing voucher (allowed only while in `Draft` status).
- `POST /api/vouchers/:id/submit`: Submits an existing draft voucher for approval with employee signature.
- `DELETE /api/vouchers/:id`: Deletes a voucher (allowed only while in `Draft` status).
- `POST /api/vouchers/:id/approve`: Approves a pending voucher (Director only; validates mandatory `director_signature_url`).
- `POST /api/vouchers/:id/reject`: Rejects a pending voucher (Director only; validates mandatory `rejection_reason`).

### Dashboard Endpoints (`/api/dashboard`)
- `GET /api/dashboard/stats`: Returns role-tailored metrics as specified in Section 8 of the assignment document.

### Upload Endpoints (`/api/upload`)
- `POST /api/upload/signature`: Multipart form upload for signature image files.
- `POST /api/upload/signature-base64`: Direct Base64 data URL upload from the HTML5 canvas signature pad.

---

## 🔒 Security Best Practices Implemented

1. **Role-Based Access Control (RBAC):** Server-side authorization middleware (`authorizeRoles`) prevents unauthorized privilege escalation.
2. **Data Scoping:** Employee database queries are hard-scoped to `req.user.id`; employees cannot query other users' claims.
3. **Prepared Statements:** 100% of SQL queries use parameterized prepared statements, preventing SQL injection vulnerabilities.
4. **Password Hashing:** Passwords hashed with bcryptjs salt rounds (10); plain text passwords are never stored or logged.
5. **JWT Authentication:** Tokens signed with a secret key and expire in 7 days.
6. **File Upload Security:** File upload MIME type whitelisting (`image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`) with a strict 5MB size ceiling and sanitized disk filenames.
7. **Input Validation:** Mandatory fields, non-zero amount constraints, and role state machine validations enforced at the API layer.

---

## 📌 Development Assumptions

1. **Relational Persistence:** SQLite with Write-Ahead Logging (WAL) and enforced foreign keys was selected for zero-friction local execution without requiring an external PostgreSQL daemon. The schema definition in `server/src/db/schema.sql` is standard ANSI SQL and directly compatible with PostgreSQL/MySQL.
2. **Signature Workflow:** Since users in modern environments may not always have a scanned signature image ready, an interactive HTML5 signature drawing pad is provided alongside file upload to ensure a seamless experience.
3. **Printable Document Format:** A clean, printable voucher receipt component with corporate letterhead is integrated into the voucher details view, fulfilling the optional Accounts Team download/print requirement via browser print and "Save as PDF".
