const CourseResource = require('../models/CourseResource');
const StorageLocation = require('../models/StorageLocation');

const getResources = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.category) {
    query.category = filters.category;
  }

  return CourseResource.find(query).sort({ createdAt: -1 });
};

const getResourceById = async (id) => {
  const resource = await CourseResource.findById(id);
  if (!resource) {
    throw new Error('Resource not found');
  }
  return resource;
};

const getStorageLocations = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.city) {
    query.city = new RegExp(filters.city, 'i');
  }
  if (filters.state) {
    query.state = new RegExp(filters.state, 'i');
  }

  return StorageLocation.find(query).sort({ createdAt: -1 });
};

const getStorageLocationById = async (id) => {
  const storageLocation = await StorageLocation.findById(id);
  if (!storageLocation) {
    throw new Error('Storage location not found');
  }
  return storageLocation;
};

module.exports = {
  getResources,
  getResourceById,
  getStorageLocations,
  getStorageLocationById
};
