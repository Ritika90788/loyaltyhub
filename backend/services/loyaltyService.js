const { User, PointsTransaction } = require('../models'); const { httpError } = require('../middleware/auth');
const POINTS_PER_100 = 10, POINT_VALUE = 0.1; // 10 pts = ₹1
const BONUS = { Bronze: 0, Silver: 0.05, Gold: 0.1, Platinum: 0.2 };
const levelFor = (p) => p >= 10000 ? 'Platinum' : p >= 3000 ? 'Gold' : p >= 1000 ? 'Silver' : 'Bronze';
exports.POINT_VALUE = POINT_VALUE;
exports.calcEarn = (amount, level, campaignMultiplier = 1) =>
  Math.floor(Math.floor(amount / 100) * POINTS_PER_100 * (1 + BONUS[level]) * campaignMultiplier);
// Single entry point: the balance never changes without a ledger entry.
exports.record = async ({ userId, type, points, reason, order, store, noTier }) => {
  const delta = type === 'EARN' || type === 'BONUS' ? Math.abs(points) : -Math.abs(points);
  const filter = delta < 0 ? { _id: userId, loyaltyPoints: { $gte: -delta } } : { _id: userId };
  const inc = { loyaltyPoints: delta }; if (delta > 0 && !noTier) inc.lifetimePoints = delta; // welcome points do not count towards tier upgrades
  const user = await User.findOneAndUpdate(filter, { $inc: inc }, { new: true });
  if (!user) throw httpError(400, 'Insufficient loyalty points');
  const lvl = levelFor(user.lifetimePoints);
  if (lvl !== user.membershipLevel) await User.updateOne({ _id: userId }, { membershipLevel: lvl });
  return PointsTransaction.create({ user: userId, type, points: Math.abs(points), reason, order, store });
};
exports.reverseOrder = async (order) => {
  if (order.pointsEarned) {
    const u = await User.findById(order.user);
    await exports.record({ userId: order.user, type: 'REVERSAL', points: Math.min(order.pointsEarned, u.loyaltyPoints), reason: `Order ${order.orderNumber} cancelled`, order: order._id });
  }
  if (order.pointsUsed) await exports.record({ userId: order.user, type: 'BONUS', points: order.pointsUsed, reason: `Points refunded for ${order.orderNumber}`, order: order._id });
};
