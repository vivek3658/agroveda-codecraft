const cropService = require('../services/crop.service');

const createCrop = async (req, res) => {
  try {
    const crop = await cropService.createCrop(req.user.id, req.body);

    res.status(201).json({ 
      success: true, 
      message: 'Crop created successfully',
      data: crop 
    });
  } catch (error) {
    console.error('Create Crop Error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getAllCrops = async (req, res) => {
  try {
    const filters = req.query;
    const crops = await cropService.getAllCrops(filters);
    res.status(200).json({ 
      success: true, 
      data: crops 
    });
  } catch (error) {
    console.error('Get All Crops Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getCropById = async (req, res) => {
  try {
    const crop = await cropService.getCropById(req.params.id);

    res.status(200).json({ 
      success: true, 
      data: crop 
    });
  } catch (error) {
    console.error('Get Crop By ID Error:', error.message);
    res.status(404).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const updateCrop = async (req, res) => {
  try {
    const crop = await cropService.updateCrop(req.user.id, req.params.id, req.body);

    res.status(200).json({ 
      success: true, 
      message: 'Crop updated successfully',
      data: crop 
    });
  } catch (error) {
    console.error('Update Crop Error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const deleteCrop = async (req, res) => {
  try {
    const result = await cropService.deleteCrop(req.user.id, req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('Delete Crop Error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getMyCrops = async (req, res) => {
  try {
    const filters = req.query;
    const crops = await cropService.getFarmerCrops(req.user.id, filters);

    res.status(200).json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('Get My Crops Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getMyCrops
};
