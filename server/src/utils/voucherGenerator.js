import db from '../db/database.js';

/**
 * Generates a unique sequential voucher number in the format EV-YYYYMMDD-XXXX
 */
export function generateVoucherNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `EV-${year}${month}${day}-`;

  // Find the highest sequence for today
  const lastVoucher = db
    .prepare('SELECT voucher_number FROM vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1')
    .get(`${datePrefix}%`);

  let nextSeq = 1;
  if (lastVoucher && lastVoucher.voucher_number) {
    const parts = lastVoucher.voucher_number.split('-');
    if (parts.length >= 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  }

  // Double check uniqueness loop
  let voucherNumber = `${datePrefix}${String(nextSeq).padStart(4, '0')}`;
  let exists = db.prepare('SELECT id FROM vouchers WHERE voucher_number = ?').get(voucherNumber);
  while (exists) {
    nextSeq++;
    voucherNumber = `${datePrefix}${String(nextSeq).padStart(4, '0')}`;
    exists = db.prepare('SELECT id FROM vouchers WHERE voucher_number = ?').get(voucherNumber);
  }

  return voucherNumber;
}
