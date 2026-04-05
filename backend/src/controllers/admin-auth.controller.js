const adminAuthService = require('../services/admin-auth.service');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await adminAuthService.loginAdmin(username, password);
    res.status(200).json({
      success: true,
      token: result.token,
      admin: result.admin
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  loginAdmin
};
