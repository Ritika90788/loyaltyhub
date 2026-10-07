const r = require('express').Router();
const { Wishlist, Order, User, Coupon } = require('../models'); const { PointsTransaction } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
r.get('/wishlist', protect, wrap(async (req, res) => { const w = await Wishlist.findOne({ user: req.user._id }).populate('products'); res.json(w ? w.products : []); }));
r.post('/wishlist/:id', protect, wrap(async (req, res) => {
  const w = (await Wishlist.findOne({ user: req.user._id })) || (await Wishlist.create({ user: req.user._id, products: [] }));
  const has = w.products.some((p) => p.equals(req.params.id)); w.products = has ? w.products.filter((p) => !p.equals(req.params.id)) : [...w.products, req.params.id];
  await w.save(); res.json({ saved: !has });
}));
r.get('/coupons', protect, wrap(async (req, res) => res.json(await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() }, usedBy: { $ne: req.user._id }, $or: [{ owner: null }, { owner: req.user._id }] }).sort('expiryDate'))));
r.get('/admin/stats', protect, adminOnly, wrap(async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'Cancelled' } }).sort('-createdAt');
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), key: d.toDateString(), revenue: 0 }; });
  orders.forEach((o) => { const d = days.find((x) => x.key === new Date(o.createdAt).toDateString()); if (d) d.revenue += o.totalAmount; });
  const sum = async (types) => (await PointsTransaction.aggregate([{ $match: { type: { $in: types } } }, { $group: { _id: null, t: { $sum: '$points' } } }]))[0]?.t || 0;
  res.json({ revenue: orders.reduce((s, o) => s + o.totalAmount, 0), orders: orders.length, users: await User.countDocuments(), coupons: await Coupon.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } }),
    issued: await sum(['EARN', 'BONUS']), redeemed: await sum(['REDEEM']), days, recent: orders.slice(0, 6) });
}));
module.exports = r;
