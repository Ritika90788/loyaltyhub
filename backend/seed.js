require('dotenv').config(); const mongoose = require('mongoose'); const bcrypt = require('bcryptjs');
const { User, Store, Product, Coupon, Order, PointsTransaction, Wishlist, Review, Notification } = require('./models');
const KW = { Men: 'tshirt', Women: 'jeans', Shoes: 'sneakers', Accessories: 'watch', Skincare: 'skincare', Makeup: 'lipstick', Audio: 'earbuds', Wearables: 'smartwatch', Decor: 'lamp', Bedding: 'bedsheet', Kitchen: 'mug', Lifestyle: 'bottle', Bags: 'backpack' };
const KEY = { 'Stainless Steel Water Bottle': 'bottle', 'Anti-Theft Laptop Backpack': 'backpack', 'Men Cotton Oversized Tee': 'tee', 'Women High-Rise Denim Jeans': 'jeans', 'Everyday Running Sneakers': 'sneakers', 'Minimal Analog Watch': 'watch', 'Vitamin C Serum 30ml': 'serum', 'SPF 50 Daily Sunscreen': 'sunscreen', 'Hydrating Gel Moisturizer': 'moisturizer', 'Matte Lipstick Set': 'lipstick', 'Wireless Earbuds Pro': 'earbuds', '20000mAh Power Bank': 'powerbank', 'Smart Fitness Band': 'band', 'Warm LED Table Lamp': 'lamp', 'Cotton Bedsheet Set (Queen)': 'bedsheet', 'Ceramic Coffee Mug Set of 4': 'mug' };
const img = (s) => `https://picsum.photos/seed/${s}/600/600`;
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Store, Product, Coupon, Order, PointsTransaction, Wishlist, Review, Notification].map((m) => m.deleteMany({})));
  const stores = await Store.insertMany([
    { name: 'ShopKart', category: 'General marketplace', description: 'Everything for everyday life.' },
    { name: 'StyleHub', category: 'Fashion', description: 'Fashion for everyday life.' },
    { name: 'GlowMart', category: 'Beauty & skincare', description: 'Skincare and beauty essentials.' },
    { name: 'TechZone', category: 'Electronics', description: 'Gadgets and accessories.' },
    { name: 'HomeNest', category: 'Home & lifestyle', description: 'Make your space yours.' }]);
  const S = Object.fromEntries(stores.map((s) => [s.name, s._id]));
  const P = [['ShopKart','Daily Co','Stainless Steel Water Bottle',699,999,'Lifestyle'],['ShopKart','PackIt','Anti-Theft Laptop Backpack',1499,2299,'Bags'],
    ['StyleHub','Urban Weave','Men Cotton Oversized Tee',599,999,'Men'],['StyleHub','Urban Weave','Women High-Rise Denim Jeans',1699,2499,'Women'],
    ['StyleHub','StrideX','Everyday Running Sneakers',2499,3999,'Shoes'],['StyleHub','Gilt','Minimal Analog Watch',1299,1999,'Accessories'],
    ['GlowMart','Lumio','Vitamin C Serum 30ml',549,799,'Skincare'],['GlowMart','Lumio','SPF 50 Daily Sunscreen',399,550,'Skincare'],
    ['GlowMart','Petal','Hydrating Gel Moisturizer',449,650,'Skincare'],['GlowMart','Petal','Matte Lipstick Set',699,999,'Makeup'],
    ['TechZone','SoundPeak','Wireless Earbuds Pro',1999,3499,'Audio'],['TechZone','VoltGo','20000mAh Power Bank',1299,1899,'Accessories'],
    ['TechZone','FitBeat','Smart Fitness Band',2199,3299,'Wearables'],['HomeNest','Lumen','Warm LED Table Lamp',899,1399,'Decor'],
    ['HomeNest','Cozy','Cotton Bedsheet Set (Queen)',1199,1999,'Bedding'],['HomeNest','Brew','Ceramic Coffee Mug Set of 4',649,999,'Kitchen']];
  await Product.insertMany(P.map(([s, brand, name, price, originalPrice, category], i) => ({ store: S[s], brand, name, price, originalPrice, category,
    description: `${name} by ${brand}. Quality you can rely on.`, images: KEY[name] ? [`/products/${KEY[name]}.svg`] : [], stock: 20 + i, rating: +(3.8 + (i % 12) / 10).toFixed(1), reviewsCount: 40 + i * 13, tags: name.toLowerCase().split(' ') })));
  const in30 = new Date(Date.now() + 30 * 864e5);
  await Coupon.insertMany([{ code: 'SAVE20', discountType: 'percent', discountValue: 20, minimumOrder: 500, maximumDiscount: 200, expiryDate: in30, usageLimit: 100 },
    { code: 'WELCOME100', discountType: 'flat', discountValue: 100, minimumOrder: 799, expiryDate: in30 }, { code: 'GLOW15', discountType: 'percent', discountValue: 15, minimumOrder: 400, maximumDiscount: 150, expiryDate: in30, store: S.GlowMart }]);
  const pw = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([{ name: 'Admin', email: 'admin@loyaltyhub.com', password: pw, role: 'admin' }, { name: 'Ritika', email: 'ritika@demo.com', password: pw, loyaltyPoints: 1250, lifetimePoints: 2450, membershipLevel: 'Silver' }]);
  await PointsTransaction.create({ user: users[1]._id, type: 'BONUS', points: 1250, reason: 'Welcome bonus' });
  console.log('Seeded. Login: ritika@demo.com / password123  |  admin@loyaltyhub.com / password123'); process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
