const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const result = await authService.registerUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    const result = await authService.googleLogin(idToken, role);
    
    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Google Login Error:', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully (frontend should clear storage)' });
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { register, login, googleLogin, getMe, logout };
