const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const config = require('../config');
const { signUserToken } = require('../utils/jwt');

const client = new OAuth2Client(config.googleClientId);

const normalizeRole = (role) => {
  return role === 'farmer' ? 'farmer' : 'consumer';
};

const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password and create user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email: String(email).toLowerCase(),
    password: hashedPassword,
    role: normalizeRole(role)
  });

  const savedUser = await user.save();
  const token = signUserToken(savedUser);
  
  return { 
    user: { 
      id: savedUser._id, 
      name: savedUser.name, 
      email: savedUser.email, 
      role: savedUser.role 
    }, 
    token 
  };
};

const loginUser = async (email, password) => {
  // Find user and verify password
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signUserToken(user);
  return { 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    }, 
    token 
  };
};

const googleLogin = async (idToken, requestedRole) => {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: config.googleClientId, 
  });
  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({ email: String(email).toLowerCase() });

  if (!user) {
    // Create new user
    user = new User({
      name,
      email: String(email).toLowerCase(),
      googleId,
      role: normalizeRole(requestedRole), 
      isEmailVerified: true
    });
    await user.save();
  } else {
    // Link Google ID to existing user
    user.googleId = googleId;
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  }

  const token = signUserToken(user);
  return { 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    }, 
    token 
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin
};
