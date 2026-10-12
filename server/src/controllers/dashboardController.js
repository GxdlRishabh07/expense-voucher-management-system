import db from '../db/database.js';

export const dashboardController = {
  // GET /api/dashboard/stats - dynamically computes role-tailored metrics according to Section 8
  async getDashboardStats(req, res, next) {
    try {
      const user = req.user;
      const today = new Date().toISOString().split('T')[0];

      if (user.role === 'employee') {
        // Employee Dashboard Metrics (scoped to user.id)
        const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ?').get(user.id).count;
        const draftVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Draft'").get(user.id).count;
        const pendingApproval = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Pending Approval'").get(user.id).count;
        const approvedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Approved'").get(user.id).count;
        const rejectedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE employee_id = ? AND status = 'Rejected'").get(user.id).count;
        const totalClaimed = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE employee_id = ?').get(user.id).total;

        const recentVouchers = db.prepare(`
          SELECT * FROM vouchers 
          WHERE employee_id = ? 
          ORDER BY created_at DESC 
          LIMIT 5
        `).all(user.id);

        return res.status(200).json({
          success: true,
          role: 'employee',
          data: {
            totalVouchers,
            draftVouchers,
            pendingApproval,
            approvedVouchers,
            rejectedVouchers,
            totalAmountClaimed: totalClaimed,
            recentVouchers
          }
        });
      }

      if (user.role === 'director') {
        // Director Dashboard Metrics (across organization)
        const pendingApprovalCount = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Pending Approval'").get().count;
        const approvedToday = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved' AND date(approval_date) = date(?)").get(today).count;
        const totalApprovedCount = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved'").get().count;
        const rejectedToday = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected' AND date(updated_at) = date(?)").get(today).count;
        const totalPendingAmount = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Pending Approval'").get().total;
        const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers').get().count;
        const totalApprovedAmount = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Approved'").get().total;

        const recentVoucherActivity = db.prepare(`
          SELECT a.*, v.voucher_number, v.expense_title, v.amount 
          FROM audit_logs a
          JOIN vouchers v ON a.voucher_id = v.id
          ORDER BY a.created_at DESC 
          LIMIT 6
        `).all();

        const pendingVouchers = db.prepare(`
          SELECT * FROM vouchers 
          WHERE status = 'Pending Approval' 
          ORDER BY created_at ASC 
          LIMIT 5
        `).all();

        const approvedVouchers = db.prepare(`
          SELECT * FROM vouchers 
          WHERE status = 'Approved' 
          ORDER BY approval_date DESC, updated_at DESC 
          LIMIT 5
        `).all();

        return res.status(200).json({
          success: true,
          role: 'director',
          data: {
            pendingApprovalCount,
            approvedToday,
            totalApprovedCount,
            rejectedToday,
            totalPendingAmount,
            totalVouchers,
            totalApprovedAmount,
            recentVoucherActivity,
            pendingVouchers,
            approvedVouchers
          }
        });
      }

      if (user.role === 'accounts') {
        // Accounts Dashboard Metrics (across organization)
        const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers').get().count;
        const pendingApproval = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Pending Approval'").get().count;
        const approvedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved'").get().count;
        const rejectedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected'").get().count;
        const totalApprovedAmount = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Approved'").get().total;

        const recentApprovedVouchers = db.prepare(`
          SELECT * FROM vouchers 
          WHERE status = 'Approved' 
          ORDER BY approval_date DESC, updated_at DESC 
          LIMIT 6
        `).all();

        return res.status(200).json({
          success: true,
          role: 'accounts',
          data: {
            totalVouchers,
            pendingApproval,
            approvedVouchers,
            rejectedVouchers,
            totalApprovedExpenseAmount: totalApprovedAmount,
            recentApprovedVouchers
          }
        });
      }

      res.status(400).json({ success: false, message: 'Unrecognized user role' });
    } catch (err) {
      next(err);
    }
  }
};
