const { Coupon } = require('../models'); const { httpError } = require('../middleware/auth');
// items are built server-side from the DB: [{ store, category, price, qty }]
exports.validate = async (code, userId, items) => {
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
  if (!c) throw httpError(400, 'Invalid coupon code');
  if (c.owner && !c.owner.equals(userId)) throw httpError(403, 'This coupon belongs to another account. Open the shared link to claim it.');
  if (!c.isActive) throw httpError(400, 'This coupon is no longer active');
  if (c.expiryDate < new Date()) throw httpError(400, 'This coupon has expired');
  if (c.usageLimit && c.usedCount >= c.usageLimit) throw httpError(400, 'Coupon usage limit reached');
  if (c.usedBy.some((u) => u.equals(userId))) throw httpError(400, 'You have already used this coupon');
  const eligible = items.filter((i) => (!c.store || String(i.store) === String(c.store)) && (!c.category || i.category === c.category));
  if (!eligible.length) throw httpError(400, 'Coupon is not applicable to items in your cart');
  const base = eligible.reduce((s, i) => s + i.price * i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (total < c.minimumOrder) throw httpError(400, `Minimum order of ₹${c.minimumOrder} required`);
  let d = c.discountType === 'percent' ? (base * c.discountValue) / 100 : c.discountValue;
  if (c.maximumDiscount) d = Math.min(d, c.maximumDiscount);
  return { coupon: c, discount: Math.round(Math.min(d, base)) };
};
