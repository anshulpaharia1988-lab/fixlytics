const COUPONS: Record<string, { discount: number; maxUses: number }> = {
  'BETA100': { discount: 100, maxUses: 20 },
  'LAUNCH50': { discount: 50, maxUses: 50 },
};

export function validateCoupon(code: string): {
  valid: boolean;
  discount: number;
  message: string;
} {
  const coupon = COUPONS[code.toUpperCase()];
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
  return { valid: true, discount: coupon.discount, message: `${coupon.discount}% discount applied!` };
}
