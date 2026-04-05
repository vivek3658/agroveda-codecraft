const Crop = require('../models/Crop');
const { syncListingFromCrop, removeListingForCrop } = require('./listing-sync.service');

const createCrop = async (farmerId, cropData) => {
  const crop = await Crop.create({ ...cropData, farmer: farmerId });
  await syncListingFromCrop(crop);
  return crop;
};

const getAllCrops = async (filters = {}) => {
  const { search, category, minPrice, maxPrice, sortBy, order, page = 1, limit = 10 } = filters;
  let query = { isAvailable: true };

  // Text search on name and description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sort = {};
  if (sortBy) {
    sort[sortBy] = order === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Newest first by default
  }

  const skip = (page - 1) * limit;

  const crops = await Crop.find(query)
    .populate('farmer', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Crop.countDocuments(query);

  return {
    crops,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getCropById = async (cropId) => {
  const crop = await Crop.findById(cropId).populate('farmer', 'name email');
  if (!crop) throw new Error('Crop not found');
  return crop;
};

const updateCrop = async (farmerId, cropId, updateData) => {
  const crop = await Crop.findById(cropId);
  if (!crop) throw new Error('Crop not found');

  // Check authorization
  if (crop.farmer.toString() !== farmerId.toString()) {
    throw new Error('You are not authorized to update this crop');
  }

  Object.assign(crop, updateData);
  const updatedCrop = await crop.save();
  await syncListingFromCrop(updatedCrop);
  return updatedCrop;
};

const deleteCrop = async (farmerId, cropId) => {
  const crop = await Crop.findById(cropId);
  if (!crop) throw new Error('Crop not found');

  // Check authorization
  if (crop.farmer.toString() !== farmerId.toString()) {
    throw new Error('You are not authorized to delete this crop');
  }

  await removeListingForCrop(crop._id);
  await crop.deleteOne();
  return { success: true };
};

const getFarmerCrops = async (farmerId, filters = {}) => {
  const { page = 1, limit = 10, sortBy, order } = filters;

  let sort = {};
  if (sortBy) {
    sort[sortBy] = order === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Newest first by default
  }

  const skip = (page - 1) * limit;

  const crops = await Crop.find({ farmer: farmerId })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Crop.countDocuments({ farmer: farmerId });

  return {
    crops,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getFarmerCrops
};
