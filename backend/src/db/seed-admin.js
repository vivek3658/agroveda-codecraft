require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const config = require('../config');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await Admin.findOne({ username: config.adminUsername });
  if (existingAdmin) {
    console.log(`Admin already exists: ${config.adminUsername}`);
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  const admin = await Admin.create({
    username: config.adminUsername,
    passwordHash
  });

  console.log(`Admin seeded: ${admin.username}`);
  return admin;
};

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Admin seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin;
