const profileService = require('../services/profile.service');

const getMyProfile = async (req, res) => {
  try {
    const profile = await profileService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const profile = await profileService.upsertMyProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const profile = await profileService.upsertMyProfile(req.user.id, {
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      farmSize: '',
      experience: '',
      specialization: [],
      avatarUrl: ''
    });
    res.status(200).json({
      success: true,
      message: 'Profile fields cleared successfully',
      data: profile
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile
};
