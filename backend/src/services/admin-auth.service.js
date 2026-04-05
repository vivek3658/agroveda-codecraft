const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const seedAdmin = require('../db/seed-admin');
const { signAdminToken } = require('../utils/jwt');

const loginAdmin = async (username, password) => {
  await seedAdmin();

  const admin = await Admin.findOne({ username });
  if (!admin || admin.status !== 'active') {
    throw new Error('Invalid admin credentials');
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid admin credentials');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  return {
    admin: {
      id: admin._id,
      username: admin.username
    },
    token: signAdminToken(admin)
  };
};

module.exports = {
  loginAdmin
};
