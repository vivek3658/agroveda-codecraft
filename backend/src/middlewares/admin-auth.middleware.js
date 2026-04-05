const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin token is required' });
  }

  try {
    const decoded = jwt.verify(token, config.adminJwtSecret);
    if (decoded.tokenType !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin token' });
    }

    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Admin authorization failed' });
  }
};

module.exports = {
  protectAdmin
};
