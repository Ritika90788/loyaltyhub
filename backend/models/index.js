const { Schema, model, Types } = require('mongoose');
const ts = { timestamps: true };
exports.User = model('User', new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  loyaltyPoints: { type: Number, default: 0, min: 0 }, referralCode: String, referredBy: { type: Types.ObjectId, ref: 'User' }, lifetimePoints: { type: Number, default: 0 },
  membershipLevel: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' } }, ts));
exports.Store = model('Store', new Schema({ name: String, description: String, category: String, logo: String, banner: String, isActive: { type: Boolean, default: true } }, ts));
exports.Product = model('Product', new Schema({
  store: { type: Types.ObjectId, ref: 'Store', index: true }, name: String, brand: String, description: String,
  price: { type: Number, required: true }, originalPrice: Number, category: { type: String, index: true }, images: [String],
  stock: { type: Number, default: 0, min: 0 }, rating: { type: Number, default: 0 }, reviewsCount: { type: Number, default: 0 }, tags: [String] }, ts));
exports.Coupon = model('Coupon', new Schema({
  code: { type: String, unique: true, uppercase: true }, discountType: { type: String, enum: ['percent', 'flat'] }, discountValue: Number,
  minimumOrder: { type: Number, default: 0 }, maximumDiscount: Number, expiryDate: Date, usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 }, store: { type: Types.ObjectId, ref: 'Store' }, category: String,
  usedBy: [{ type: Types.ObjectId, ref: 'User' }], owner: { type: Types.ObjectId, ref: 'User' }, isActive: { type: Boolean, default: true } }, ts));
exports.Order = model('Order', new Schema({
  user: { type: Types.ObjectId, ref: 'User', index: true }, orderNumber: String,
  items: [{ product: { type: Types.ObjectId, ref: 'Product' }, store: { type: Types.ObjectId, ref: 'Store' }, name: String, category: String, price: Number, qty: Number }],
  subtotal: Number, coupon: String, discount: { type: Number, default: 0 }, pointsUsed: { type: Number, default: 0 }, pointsDiscount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 }, totalAmount: Number, pointsEarned: { type: Number, default: 0 }, address: Object, paymentMethod: String,
  status: { type: String, enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' } }, ts));
exports.PointsTransaction = model('PointsTransaction', new Schema({
  user: { type: Types.ObjectId, ref: 'User', index: true }, store: { type: Types.ObjectId, ref: 'Store' }, order: { type: Types.ObjectId, ref: 'Order' },
  type: { type: String, enum: ['EARN', 'REDEEM', 'REVERSAL', 'BONUS', 'EXPIRED'], required: true }, points: Number, reason: String }, ts));
exports.Wishlist = model('Wishlist', new Schema({ user: { type: Types.ObjectId, ref: 'User', unique: true }, products: [{ type: Types.ObjectId, ref: 'Product' }] }));
exports.Review = model('Review', new Schema({ product: { type: Types.ObjectId, ref: 'Product', index: true }, user: { type: Types.ObjectId, ref: 'User' }, name: String, rating: { type: Number, min: 1, max: 5 }, comment: String }, ts));
exports.Notification = model('Notification', new Schema({ user: { type: Types.ObjectId, index: true }, text: String, read: { type: Boolean, default: false } }, ts));
