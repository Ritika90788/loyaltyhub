const r = require('express').Router(); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken');
const { User, Product, Store, Coupon, PointsTransaction } = require('../models'); const loyalty = require('../services/loyaltyService');
const { protect, adminOnly, httpError } = require('../middleware/auth');
const orders = require('../controllers/orderController'); const ai = require('../services/aiService'); const couponSvc = require('../services/couponService');
const notify = require('../services/notify'); const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
r.post('/auth/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) throw httpError(400, 'Enter a name, valid email and a password of 6+ characters');
  if (await User.exists({ email })) throw httpError(409, 'Email already registered');
  const refUser = req.body.ref ? await User.findOne({ referralCode: String(req.body.ref).toUpperCase() }) : null;
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10), referredBy: refUser?._id, referralCode: name.toUpperCase().replace(/\W/g, '').slice(0, 8) + Math.floor(100 + Math.random() * 900) });
  const welcome = refUser ? 1200 : 1000;
  await loyalty.record({ userId: u._id, type: 'BONUS', points: welcome, reason: refUser ? 'Welcome bonus (referral signup)' : 'Welcome bonus', noTier: true });
  notify.push(u._id, `Welcome to LoyaltyHub. ${welcome} points have been added to your wallet.`);
  res.status(201).json({ token: sign(u), user: { id: u._id, name, email, role: u.role, loyaltyPoints: welcome, membershipLevel: 'Bronze', lifetime: 0 } });
}));
r.post('/auth/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: req.body.email }).select('+password');
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) throw httpError(401, 'Incorrect email or password');
  res.json({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role, loyaltyPoints: u.loyaltyPoints, membershipLevel: u.membershipLevel } });
}));
r.get('/stores', wrap(async (req, res) => res.json(await Store.find({ isActive: true }))));
r.get('/products', wrap(async (req, res) => {
  const { store, category, minPrice, maxPrice, q, sort = '-createdAt', page = 1, limit = 12 } = req.query; const f = {};
  if (store) f.store = store; if (category) f.category = category; if (q) f.name = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (minPrice || maxPrice) f.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  const [items, total] = await Promise.all([Product.find(f).sort(sort).skip((page - 1) * limit).limit(+limit), Product.countDocuments(f)]);
  res.json({ items, total, pages: Math.ceil(total / limit) });
}));
r.get('/products/:id', wrap(async (req, res) => { const p = await Product.findById(req.params.id); if (!p) throw httpError(404, 'Product not found'); res.json(p); }));
r.post('/products', protect, adminOnly, wrap(async (req, res) => res.status(201).json(await Product.create(req.body))));
r.put('/products/:id', protect, adminOnly, wrap(async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
r.delete('/products/:id', protect, adminOnly, wrap(async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.status(204).end(); }));
r.post('/coupons/validate', protect, wrap(async (req, res) => {
  const lines = []; for (const i of req.body.items || []) { const p = await Product.findById(i.productId); if (p) lines.push({ store: p.store, category: p.category, price: p.price, qty: Math.max(1, +i.qty || 1) }); }
  const { coupon, discount } = await couponSvc.validate(req.body.code, req.user._id, lines); res.json({ code: coupon.code, discount });
}));
r.post('/orders', protect, orders.place); r.get('/orders', protect, orders.mine); r.get('/orders/:id', protect, orders.one); r.put('/orders/:id/cancel', protect, orders.cancel);
r.get('/points', protect, wrap(async (req, res) => res.json({ points: req.user.loyaltyPoints, value: req.user.loyaltyPoints / 10, level: req.user.membershipLevel, lifetime: req.user.lifetimePoints })));
r.get('/points/transactions', protect, wrap(async (req, res) => res.json(await PointsTransaction.find({ user: req.user._id, ...(req.query.type && { type: req.query.type }) }).sort('-createdAt').limit(100))));
r.post('/ai/shopping-assistant', protect, wrap(async (req, res) => { if (!req.body.message) throw httpError(400, 'Message is required'); res.json(await ai.shoppingAssistant(req.body.message, req.user)); }));
r.post('/ai/generate-campaign', protect, adminOnly, wrap(async (req, res) => res.json(await ai.campaign(req.body))));
const REWARDS = { r50: { pts: 500, type: 'flat', val: 50, name: '₹50 Shopping Reward' }, r100: { pts: 1000, type: 'flat', val: 100, name: '₹100 Shopping Reward' }, ship: { pts: 300, type: 'flat', val: 49, name: 'Free Shipping' }, p10: { pts: 700, type: 'percent', val: 10, name: '10% OFF Coupon' } };
r.post('/points/redeem', protect, wrap(async (req, res) => {
  const rw = REWARDS[req.body.rewardId]; if (!rw) throw httpError(404, 'Reward not found');
  await loyalty.record({ userId: req.user._id, type: 'REDEEM', points: rw.pts, reason: `Redeemed ${rw.name}` });
  const code = 'RW' + Math.random().toString(36).slice(2, 8).toUpperCase();
  await Coupon.create({ code, discountType: rw.type, discountValue: rw.val, maximumDiscount: rw.type === 'percent' ? 500 : undefined, expiryDate: new Date(Date.now() + 30 * 864e5), usageLimit: 1, owner: req.user._id });
  res.json({ code });
}));
module.exports = r;
