const Listing = require('../models/Listing');

const getListingStatusFromCrop = (crop) => {
  if (!crop.isAvailable || crop.quantity <= 0) {
    return 'sold_out';
  }

  return 'published';
};

const syncListingFromCrop = async (crop) => {
  const primaryImage = Array.isArray(crop.images) && crop.images.length > 0 ? crop.images[0] : '';

  return Listing.findOneAndUpdate(
    { crop: crop._id },
    {
      crop: crop._id,
      farmer: crop.farmer,
      sellerType: 'farmer',
      name: crop.name,
      category: crop.category,
      description: crop.description,
      price: crop.price,
      unit: crop.unit,
      quantity: crop.quantity,
      location: crop.location,
      image: primaryImage,
      images: crop.images || [],
      status: getListingStatusFromCrop(crop),
      lastSyncedAt: new Date()
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
};

const removeListingForCrop = async (cropId) => {
  await Listing.deleteOne({ crop: cropId });
};

module.exports = {
  syncListingFromCrop,
  removeListingForCrop
};
