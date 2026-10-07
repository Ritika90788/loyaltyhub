const { Notification } = require('../models');
exports.push = (user, text) => Notification.create({ user, text }).catch(() => {});
