import db from '../db/database.js';
import { generateVoucherNumber } from '../utils/voucherGenerator.js';

export const voucherController = {
  // GET /api/vouchers - list vouchers with role-based scoping and multi-attribute filters
  async getVouchers(req, res, next) {
    try {
      const user = req.user;
      const {
        search,
        voucher_number,
        employee_name,
        department,
        category,
        status,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      let conditions = [];
      let params = [];

      // 1. Role-based scoping
      if (user.role === 'employee') {
        conditions.push('v.employee_id = ?');
        params.push(user.id);
      }
      // Director & Accounts see all vouchers by default

      // 2. Search & Filtering criteria
      if (search && search.trim()) {
        conditions.push(`(
          v.voucher_number LIKE ? OR
          v.employee_name LIKE ? OR
          v.expense_title LIKE ? OR
          v.department_name LIKE ? OR
          v.expense_category LIKE ?
        )`);
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (voucher_number && voucher_number.trim()) {
        conditions.push('v.voucher_number LIKE ?');
        params.push(`%${voucher_number.trim()}%`);
      }

      if (employee_name && employee_name.trim()) {
        conditions.push('v.employee_name LIKE ?');
        params.push(`%${employee_name.trim()}%`);
      }

      if (department && department.trim()) {
        conditions.push('v.department_name = ?');
        params.push(department.trim());
      }

      if (category && category.trim()) {
        conditions.push('v.expense_category = ?');
        params.push(category.trim());
      }

      if (status && status.trim()) {
        conditions.push('v.status = ?');
        params.push(status.trim());
      }

      if (startDate) {
        conditions.push('v.expense_date >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('v.expense_date <= ?');
        params.push(endDate);
      }

      if (minAmount && !isNaN(parseFloat(minAmount))) {
        conditions.push('v.amount >= ?');
        params.push(parseFloat(minAmount));
      }

      if (maxAmount && !isNaN(parseFloat(maxAmount))) {
        conditions.push('v.amount <= ?');
        params.push(parseFloat(maxAmount));
      }

      // Safe sorting whitelist
      const allowedSortColumns = ['created_at', 'updated_at', 'amount', 'expense_date', 'voucher_date', 'voucher_number', 'status'];
      const sortCol = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT v.* 
        FROM vouchers v
        ${whereClause}
        ORDER BY v.${sortCol} ${order}
      `;

      const vouchers = db.prepare(query).all(...params);

      res.status(200).json({
        success: true,
        count: vouchers.length,
        data: vouchers
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/vouchers/:id - view single voucher with audit history
  async getVoucherById(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: 'Voucher not found.'
        });
      }

      // Role check: employees can only view their own vouchers
      if (user.role === 'employee' && voucher.employee_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. Employees may only view vouchers created by themselves.'
        });
      }

      // Fetch audit logs
      const auditLogs = db.prepare(`
        SELECT * FROM audit_logs 
        WHERE voucher_id = ? 
        ORDER BY created_at ASC
      `).all(id);

      res.status(200).json({
        success: true,
        data: {
          ...voucher,
          audit_logs: auditLogs
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/vouchers - create voucher (Draft or Submit)
  async createVoucher(req, res, next) {
    try {
      const user = req.user;
      const {
        expense_date,
        department_name,
        expense_title,
        expense_category,
        expense_description,
        amount,
        employee_signature_url,
        action = 'save_draft' // 'save_draft' or 'submit'
      } = req.body;

      // Mandatory Field Validations (Section 9 of PDF)
      const errors = [];
      if (!department_name || !department_name.trim()) errors.push('Department is mandatory.');
      if (!expense_title || !expense_title.trim()) errors.push('Expense Title is mandatory.');
      if (!expense_date) errors.push('Expense Date is mandatory.');
      if (amount === undefined || amount === null || amount === '') {
        errors.push('Amount is mandatory.');
      } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        errors.push('Amount must be greater than zero.');
      }

      // If submitting, employee signature is mandatory
      const isSubmitting = action === 'submit';
      if (isSubmitting && (!employee_signature_url || !employee_signature_url.trim())) {
        errors.push('Employee Signature is mandatory before submission.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      const voucherNumber = generateVoucherNumber();
      const today = new Date().toISOString().split('T')[0];
      const initialStatus = isSubmitting ? 'Pending Approval' : 'Draft';
      const parsedAmount = parseFloat(amount);

      const stmt = db.prepare(`
        INSERT INTO vouchers (
          voucher_number, voucher_date, expense_date, department_name,
          expense_title, expense_category, expense_description, amount,
          employee_id, employee_name, employee_code, employee_signature_url,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      const result = stmt.run(
        voucherNumber,
        today,
        expense_date,
        department_name.trim(),
        expense_title.trim(),
        expense_category ? expense_category.trim() : 'Miscellaneous',
        expense_description ? expense_description.trim() : '',
        parsedAmount,
        user.id,
        user.name,
        user.employee_code || null,
        employee_signature_url || null,
        initialStatus
      );

      const newVoucherId = result.lastInsertRowid;

      // Log audit
      const auditStmt = db.prepare(`
        INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      auditStmt.run(
        newVoucherId,
        'CREATED_DRAFT',
        user.id,
        user.name,
        user.role,
        `Voucher ${voucherNumber} created as Draft.`
      );

      if (isSubmitting) {
        auditStmt.run(
          newVoucherId,
          'SUBMITTED',
          user.id,
          user.name,
          user.role,
          `Voucher ${voucherNumber} submitted for Director approval.`
        );
      }

      const createdVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(newVoucherId);

      res.status(201).json({
        success: true,
        message: isSubmitting
          ? `Voucher ${voucherNumber} submitted successfully for Director approval.`
          : `Voucher ${voucherNumber} saved as Draft.`,
        data: createdVoucher
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/vouchers/:id - edit voucher (Only allowed while in Draft status)
  async updateVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const {
        expense_date,
        department_name,
        expense_title,
        expense_category,
        expense_description,
        amount,
        employee_signature_url,
        action = 'save_draft' // 'save_draft' or 'submit'
      } = req.body;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      // Check ownership
      if (voucher.employee_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only edit your own vouchers.'
        });
      }

      // Business Rule: Employees may edit vouchers ONLY while in Draft status
      if (voucher.status !== 'Draft') {
        return res.status(400).json({
          success: false,
          message: `Cannot modify voucher. Vouchers in '${voucher.status}' status are read-only.`
        });
      }

      // Validations
      const errors = [];
      if (!department_name || !department_name.trim()) errors.push('Department is mandatory.');
      if (!expense_title || !expense_title.trim()) errors.push('Expense Title is mandatory.');
      if (!expense_date) errors.push('Expense Date is mandatory.');
      if (amount === undefined || amount === null || amount === '') {
        errors.push('Amount is mandatory.');
      } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        errors.push('Amount must be greater than zero.');
      }

      const isSubmitting = action === 'submit';
      const sigToUse = employee_signature_url || voucher.employee_signature_url;
      if (isSubmitting && (!sigToUse || !sigToUse.trim())) {
        errors.push('Employee Signature is mandatory before submission.');
      }

      if (errors.length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }

      const newStatus = isSubmitting ? 'Pending Approval' : 'Draft';
      const parsedAmount = parseFloat(amount);

      db.prepare(`
        UPDATE vouchers SET
          expense_date = ?,
          department_name = ?,
          expense_title = ?,
          expense_category = ?,
          expense_description = ?,
          amount = ?,
          employee_signature_url = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        expense_date,
        department_name.trim(),
        expense_title.trim(),
        expense_category ? expense_category.trim() : 'Miscellaneous',
        expense_description ? expense_description.trim() : '',
        parsedAmount,
        sigToUse,
        newStatus,
        id
      );

      const auditStmt = db.prepare(`
        INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      auditStmt.run(
        id,
        'UPDATED_DRAFT',
        user.id,
        user.name,
        user.role,
        'Draft voucher details updated.'
      );

      if (isSubmitting) {
        auditStmt.run(
          id,
          'SUBMITTED',
          user.id,
          user.name,
          user.role,
          'Voucher submitted for Director approval.'
        );
      }

      const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

      res.status(200).json({
        success: true,
        message: isSubmitting ? 'Voucher submitted successfully for approval.' : 'Draft updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/vouchers/:id/submit - submit an existing draft voucher
  async submitDraft(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { employee_signature_url } = req.body;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      if (voucher.employee_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only submit your own vouchers.'
        });
      }

      if (voucher.status !== 'Draft') {
        return res.status(400).json({
          success: false,
          message: `Cannot submit voucher. Current status is '${voucher.status}'. Only Draft vouchers can be submitted.`
        });
      }

      const finalSignature = employee_signature_url || voucher.employee_signature_url;
      if (!finalSignature || !finalSignature.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Employee Signature is mandatory before submission.'
        });
      }

      db.prepare(`
        UPDATE vouchers SET
          status = 'Pending Approval',
          employee_signature_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(finalSignature, id);

      db.prepare(`
        INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
        VALUES (?, 'SUBMITTED', ?, ?, ?, 'Draft voucher submitted for Director approval.')
      `).run(id, user.id, user.name, user.role);

      const submitted = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

      res.status(200).json({
        success: true,
        message: 'Voucher submitted successfully for Director approval.',
        data: submitted
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/vouchers/:id - delete voucher (Only Draft vouchers may be deleted)
  async deleteVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      if (voucher.employee_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own draft vouchers.'
        });
      }

      if (voucher.status !== 'Draft') {
        return res.status(400).json({
          success: false,
          message: `Cannot delete voucher. Only vouchers in 'Draft' status can be deleted. Current status is '${voucher.status}'.`
        });
      }

      // Delete associated audit logs then voucher
      db.prepare('DELETE FROM audit_logs WHERE voucher_id = ?').run(id);
      db.prepare('DELETE FROM vouchers WHERE id = ?').run(id);

      res.status(200).json({
        success: true,
        message: `Draft voucher ${voucher.voucher_number} deleted successfully.`
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/vouchers/:id/approve - approve voucher (Director only)
  async approveVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { director_signature_url } = req.body;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      if (voucher.status !== 'Pending Approval') {
        return res.status(400).json({
          success: false,
          message: `Cannot approve voucher. Voucher must be in 'Pending Approval' status. Current status is '${voucher.status}'.`
        });
      }

      // Mandatory Director Signature validation (Section 9 of PDF)
      if (!director_signature_url || !director_signature_url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Director Signature is mandatory before approval.'
        });
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.prepare(`
        UPDATE vouchers SET
          status = 'Approved',
          director_id = ?,
          director_name = ?,
          director_signature_url = ?,
          approval_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user.id, user.name, director_signature_url.trim(), now, id);

      db.prepare(`
        INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
        VALUES (?, 'APPROVED', ?, ?, ?, 'Voucher approved by Director with signature.')
      `).run(id, user.id, user.name, user.role);

      const approved = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

      res.status(200).json({
        success: true,
        message: `Voucher ${voucher.voucher_number} has been approved successfully.`,
        data: approved
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/vouchers/:id/reject - reject voucher (Director only)
  async rejectVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { rejection_reason } = req.body;

      const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Voucher not found.' });
      }

      if (voucher.status !== 'Pending Approval') {
        return res.status(400).json({
          success: false,
          message: `Cannot reject voucher. Voucher must be in 'Pending Approval' status. Current status is '${voucher.status}'.`
        });
      }

      // Mandatory Rejection Reason validation (Section 9 of PDF)
      if (!rejection_reason || !rejection_reason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Rejection Reason is mandatory if a voucher is rejected.'
        });
      }

      db.prepare(`
        UPDATE vouchers SET
          status = 'Rejected',
          director_id = ?,
          director_name = ?,
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user.id, user.name, rejection_reason.trim(), id);

      db.prepare(`
        INSERT INTO audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, details)
        VALUES (?, 'REJECTED', ?, ?, ?, ?)
      `).run(id, user.id, user.name, user.role, `Rejected with reason: ${rejection_reason.trim()}`);

      const rejected = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

      res.status(200).json({
        success: true,
        message: `Voucher ${voucher.voucher_number} has been rejected.`,
        data: rejected
      });
    } catch (err) {
      next(err);
    }
  }
};
