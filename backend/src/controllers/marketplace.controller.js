const marketplaceService = require('../services/marketplace.service');

const getListings = async (req, res) => {
  try {
    const data = await marketplaceService.getMarketplaceListings(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getListingById = async (req, res) => {
  try {
    const data = await marketplaceService.getListingById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const data = await marketplaceService.getMyListings(req.user.id, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getListings,
  getListingById,
  getMyListings
};
