const jwt = require('jsonwebtoken'); const { User } = require('../models');
exports.httpError = (status, message) => Object.assign(new Error(message), { status });
exports.protect = async (req, res, next) => {
  try {
    const t = (req.headers.authorization || '').replace('Bearer ', '');
    if (!t) return res.status(401).json({ message: 'Please sign in to continue' });
    req.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id);
    if (!req.user) return res.status(401).json({ message: 'Account not found' });
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
};
exports.adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: status < 500 || status === 503 ? err.message : 'Something went wrong. Please try again.' });
};
