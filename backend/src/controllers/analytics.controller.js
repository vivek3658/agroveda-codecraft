const analyticsService = require('../services/analytics.service');

const getFarmerOverview = async (req, res) => {
  try {
    const overview = await analyticsService.getFarmerOverview(req.user._id);
    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFarmerOverview
};
