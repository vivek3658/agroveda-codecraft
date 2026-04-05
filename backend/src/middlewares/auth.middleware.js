const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Focus ONLY on the Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.tokenType && decoded.tokenType !== 'user') {
        return res.status(401).json({ success: false, message: 'Invalid user token' });
      }
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ success: false, message: 'User not found' });
      }
      if (req.user.status && req.user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, authorize };
