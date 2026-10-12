import express from 'express';
import { voucherController } from '../controllers/voucherController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

// All voucher routes require authentication
router.use(authenticate);

// Listing & View details
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// Employee actions
router.post('/', authorizeRoles('employee'), voucherController.createVoucher);
router.put('/:id', authorizeRoles('employee'), voucherController.updateVoucher);
router.post('/:id/submit', authorizeRoles('employee'), voucherController.submitDraft);
router.delete('/:id', authorizeRoles('employee'), voucherController.deleteVoucher);

// Director actions
router.post('/:id/approve', authorizeRoles('director'), voucherController.approveVoucher);
router.post('/:id/reject', authorizeRoles('director'), voucherController.rejectVoucher);

export default router;
