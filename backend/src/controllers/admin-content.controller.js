const adminContentService = require('../services/admin-content.service');

const createSponsoredBrand = async (req, res) => {
  try {
    const brand = await adminContentService.createBrand(req.body);
    res.status(201).json({ success: true, message: 'Sponsored brand created successfully', data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSponsoredBrands = async (req, res) => {
  try {
    const brands = await adminContentService.listBrands();
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSponsoredBrand = async (req, res) => {
  try {
    const brand = await adminContentService.updateBrand(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Sponsored brand updated successfully', data: brand });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.message });
  }
};

const createSponsoredProduct = async (req, res) => {
  try {
    const product = await adminContentService.createSponsoredProduct(req.body);
    res.status(201).json({ success: true, message: 'Sponsored product created successfully', data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSponsoredProducts = async (req, res) => {
  try {
    const products = await adminContentService.listSponsoredProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSponsoredProduct = async (req, res) => {
  try {
    const product = await adminContentService.updateSponsoredProduct(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Sponsored product updated successfully', data: product });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.message });
  }
};

const updateSponsoredProductStatus = async (req, res) => {
  try {
    const product = await adminContentService.changeSponsoredProductStatus(req.params.id, req.body.isActive);
    res.status(200).json({ success: true, message: 'Sponsored product status updated successfully', data: product });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.message });
  }
};

const createEmailTemplate = async (req, res) => {
  try {
    const template = await adminContentService.createEmailTemplate(req.body);
    res.status(201).json({ success: true, message: 'Email template created successfully', data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getEmailTemplates = async (req, res) => {
  try {
    const templates = await adminContentService.listEmailTemplates();
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmailTemplate = async (req, res) => {
  try {
    const template = await adminContentService.updateEmailTemplate(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Email template updated successfully', data: template });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ success: false, message: error.message });
  }
};

const getEmailLogs = async (req, res) => {
  try {
    const logs = await adminContentService.listEmailLogs();
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourseResource = async (req, res) => {
  try {
    const resource = await adminContentService.createCourseResource(req.body);
    res.status(201).json({ success: true, message: 'Course/resource created successfully', data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createStorageLocation = async (req, res) => {
  try {
    const storageLocation = await adminContentService.createStorageLocation(req.body);
    res.status(201).json({ success: true, message: 'Storage location created successfully', data: storageLocation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSponsoredBrand,
  getSponsoredBrands,
  updateSponsoredBrand,
  createSponsoredProduct,
  getSponsoredProducts,
  updateSponsoredProduct,
  updateSponsoredProductStatus,
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  getEmailLogs,
  createCourseResource,
  createStorageLocation
};
