const User = require('../models/User');
const Profile = require('../models/Profile');

const formatProfileResponse = (user, profile) => ({
  id: user._id,
  role: user.role,
  name: user.name,
  email: user.email,
  phone: profile?.phone || '',
  address: profile?.address || '',
  city: profile?.city || '',
  state: profile?.state || '',
  pincode: profile?.pincode || '',
  farmSize: profile?.farmSize || '',
  experience: profile?.experience || '',
  specialization: profile?.specialization || [],
  avatarUrl: profile?.avatarUrl || ''
});

const getMyProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  const profile = await Profile.findOne({ user: userId });
  return formatProfileResponse(user, profile);
};

const upsertMyProfile = async (userId, payload) => {
  const { name, phone, address, city, state, pincode, farmSize, experience, specialization, avatarUrl } = payload;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (name) {
    user.name = name;
    await user.save();
  }

  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      phone,
      address,
      city,
      state,
      pincode,
      farmSize,
      experience,
      specialization,
      avatarUrl
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  return formatProfileResponse(user, profile);
};

module.exports = {
  getMyProfile,
  upsertMyProfile
};
