const r = require('express').Router(); const mongoose = require('mongoose');
const { Review, Notification, Product, Store, Coupon, User, Order, PointsTransaction } = require('../models'); const { protect, adminOnly, httpError } = require('../middleware/auth');
const notify = require('../services/notify'); const wrap = (fn) => (req, res, next) => fn(req, res).catch(next); const admin = [protect, adminOnly];
r.get('/products/:id/reviews', wrap(async (req, res) => res.json(await Review.find({ product: req.params.id }).sort('-createdAt').limit(30))));
r.post('/products/:id/reviews', protect, wrap(async (req, res) => {
  const rating = +req.body.rating; if (!(rating >= 1 && rating <= 5)) throw httpError(400, 'Choose a rating from 1 to 5');
  if (await Review.exists({ product: req.params.id, user: req.user._id })) throw httpError(409, 'You have already reviewed this product');
  await Review.create({ product: req.params.id, user: req.user._id, name: req.user.name, rating, comment: String(req.body.comment || '').slice(0, 500) });
  const [a] = await Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(req.params.id) } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  await Product.updateOne({ _id: req.params.id }, { rating: +a.avg.toFixed(1), reviewsCount: a.n }); res.status(201).json({ ok: true });
}));
r.get('/notifications', protect, wrap(async (req, res) => res.json(await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50))));
r.put('/notifications/read', protect, wrap(async (req, res) => { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ ok: true }); }));
r.get('/referrals', protect, wrap(async (req, res) => {
  let code = req.user.referralCode; if (!code) { code = req.user.name.toUpperCase().replace(/\W/g, '').slice(0, 8) + Math.floor(100 + Math.random() * 900); await User.updateOne({ _id: req.user._id }, { referralCode: code }); }
  const friends = await User.find({ referredBy: req.user._id }).select('_id'); let ok = 0; for (const f of friends) if (await Order.exists({ user: f._id })) ok++;
  const p = await PointsTransaction.aggregate([{ $match: { user: req.user._id, reason: /^Referral/ } }, { $group: { _id: null, t: { $sum: '$points' } } }]);
  res.json({ code, invited: friends.length, successful: ok, points: p[0]?.t || 0 });
}));
r.get('/admin/stores', ...admin, wrap(async (req, res) => res.json(await Store.find().sort('name'))));
r.post('/stores', ...admin, wrap(async (req, res) => res.status(201).json(await Store.create(req.body))));
r.put('/stores/:id', ...admin, wrap(async (req, res) => res.json(await Store.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
r.get('/admin/coupons', ...admin, wrap(async (req, res) => res.json(await Coupon.find().sort('-createdAt'))));
r.post('/admin/coupons', ...admin, wrap(async (req, res) => { if (!req.body.code) throw httpError(400, 'Coupon code is required'); res.status(201).json(await Coupon.create({ ...req.body, code: String(req.body.code).toUpperCase() })); }));
r.put('/admin/coupons/:id', ...admin, wrap(async (req, res) => res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
const open = (c) => c.isActive && c.expiryDate > new Date() && (!c.usageLimit || c.usedCount < c.usageLimit);
r.get('/coupons/claim/:code', protect, wrap(async (req, res) => {
  const c = await Coupon.findOne({ code: String(req.params.code).toUpperCase() }); if (!c || !open(c)) throw httpError(404, 'This coupon is no longer available');
  res.json({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minimumOrder: c.minimumOrder, maximumDiscount: c.maximumDiscount, expiryDate: c.expiryDate, mine: !c.owner || c.owner.equals(req.user._id) });
}));
r.post('/coupons/claim/:code', protect, wrap(async (req, res) => {
  const c = await Coupon.findOne({ code: String(req.params.code).toUpperCase() }); if (!c || !open(c)) throw httpError(404, 'This coupon is no longer available');
  if (!c.owner) return res.json({ message: 'This is a public coupon. You can use it at checkout.' });
  if (c.owner.equals(req.user._id)) return res.json({ message: 'This coupon is already in your account.' });
  const prev = c.owner; const r2 = await Coupon.updateOne({ _id: c._id, owner: prev }, { owner: req.user._id }); // atomic: first to claim wins
  if (!r2.modifiedCount) throw httpError(409, 'This coupon was just claimed by someone else');
  notify.push(prev, `Your friend ${req.user.name} claimed your gift coupon ${c.code}.`); res.json({ message: `Coupon ${c.code} added to your account.` });
}));
module.exports = r;
