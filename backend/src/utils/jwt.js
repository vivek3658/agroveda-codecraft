const jwt = require('jsonwebtoken');
const config = require('../config');

const signUserToken = (user) => jwt.sign(
  {
    id: user._id,
    role: user.role,
    email: user.email,
    tokenType: 'user'
  },
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn }
);

const signAdminToken = (admin) => jwt.sign(
  {
    id: admin._id,
    role: 'admin',
    username: admin.username,
    tokenType: 'admin'
  },
  config.adminJwtSecret,
  { expiresIn: config.adminJwtExpiresIn }
);

module.exports = {
  signUserToken,
  signAdminToken
};
