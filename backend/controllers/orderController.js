const { Product, Order, Coupon } = require('../models'); const { httpError } = require('../middleware/auth');
const notify = require('../services/notify'); const loyalty = require('../services/loyaltyService'); const couponSvc = require('../services/couponService');
const FREE_DELIVERY_ABOVE = 499, DELIVERY_FEE = 49;
exports.place = async (req, res, next) => {
  const reserved = [];
  try {
    const { items, couponCode, pointsToUse = 0, address, paymentMethod = 'COD' } = req.body;
    if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty');
    if (!address) throw httpError(400, 'Delivery address is required');
    const lines = []; // prices always come from the DB, never the client
    for (const { productId, qty } of items) {
      const q = Math.max(1, parseInt(qty) || 1);
      const p = await Product.findOneAndUpdate({ _id: productId, stock: { $gte: q } }, { $inc: { stock: -q } });
      if (!p) { const ex = await Product.findById(productId); throw httpError(ex ? 409 : 404, ex ? `${ex.name} is out of stock` : 'Product not found'); }
      reserved.push({ id: p._id, q });
      lines.push({ product: p._id, store: p.store, category: p.category, name: p.name, price: p.price, qty: q });
    }
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    let discount = 0, coupon = null;
    if (couponCode) ({ coupon, discount } = await couponSvc.validate(couponCode, req.user._id, lines));
    const pointsDiscount = Math.min(Math.floor(Math.max(0, pointsToUse) * loyalty.POINT_VALUE), subtotal - discount, Math.floor(req.user.loyaltyPoints * loyalty.POINT_VALUE));
    const pointsUsed = Math.ceil(pointsDiscount / loyalty.POINT_VALUE);
    const deliveryFee = subtotal - discount >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const totalAmount = subtotal - discount - pointsDiscount + deliveryFee;
    const first = !(await Order.exists({ user: req.user._id })); const count = await Order.countDocuments();
    const order = await Order.create({ user: req.user._id, orderNumber: `LH-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
      items: lines, subtotal, coupon: coupon?.code, discount, pointsUsed, pointsDiscount, deliveryFee, totalAmount, address, paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid' });
    if (pointsUsed) await loyalty.record({ userId: req.user._id, type: 'REDEEM', points: pointsUsed, reason: `Used on ${order.orderNumber}`, order: order._id });
    if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } });
    const earned = loyalty.calcEarn(totalAmount, req.user.membershipLevel);
    if (earned) { await loyalty.record({ userId: req.user._id, type: 'EARN', points: earned, reason: `Order ${order.orderNumber}`, order: order._id }); order.pointsEarned = earned; await order.save(); }
    if (first && req.user.referredBy) {
      await loyalty.record({ userId: req.user.referredBy, type: 'BONUS', points: 100, reason: 'Referral bonus (friend joined)', order: order._id });
      notify.push(req.user.referredBy, ' Your friend placed their first order. You earned 100 points.');
    }
    notify.push(req.user._id, ` You earned ${earned} points on ${order.orderNumber}.`);
    res.status(201).json(order);
  } catch (e) {
    for (const r of reserved) await Product.updateOne({ _id: r.id }, { $inc: { stock: r.q } });
    next(e);
  }
};
exports.cancel = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw httpError(404, 'Order not found');
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) throw httpError(400, `Order cannot be cancelled once ${order.status.toLowerCase()}`);
    order.status = 'Cancelled'; if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded'; await order.save();
    for (const i of order.items) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } });
    await loyalty.reverseOrder(order);
    res.json(order);
  } catch (e) { next(e); }
};
exports.mine = async (req, res, next) => { try { res.json(await Order.find({ user: req.user._id }).sort('-createdAt')); } catch (e) { next(e); } };
exports.one = async (req, res, next) => { try { const o = await Order.findOne({ _id: req.params.id, user: req.user._id }); if (!o) throw httpError(404, 'Order not found'); res.json(o); } catch (e) { next(e); } };
