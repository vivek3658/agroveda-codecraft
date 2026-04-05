const serviceCatalogService = require('../services/service-catalog.service');

const getResources = async (req, res) => {
  try {
    const resources = await serviceCatalogService.getResources(req.query);
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await serviceCatalogService.getResourceById(req.params.id);
    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getStorageLocations = async (req, res) => {
  try {
    const storageLocations = await serviceCatalogService.getStorageLocations(req.query);
    res.status(200).json({ success: true, data: storageLocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStorageLocationById = async (req, res) => {
  try {
    const storageLocation = await serviceCatalogService.getStorageLocationById(req.params.id);
    res.status(200).json({ success: true, data: storageLocation });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  getResources,
  getResourceById,
  getStorageLocations,
  getStorageLocationById
};
