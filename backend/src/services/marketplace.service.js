const Listing = require('../models/Listing');
const Review = require('../models/Review');

const buildMarketplaceFilters = (filters = {}) => {
  const { search, category, minPrice, maxPrice, location } = filters;
  const query = { status: 'published' };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  return query;
};

const buildSort = (sortBy, order) => {
  const direction = order === 'asc' ? 1 : -1;
  if (!sortBy) {
    return { createdAt: -1 };
  }

  return { [sortBy]: direction };
};

const mapListingCard = (listing) => ({
  id: listing._id,
  name: listing.name,
  farmer: listing.farmer?.name || '',
  location: listing.location,
  price: listing.price,
  unit: listing.unit,
  quantity: listing.quantity,
  category: listing.category,
  description: listing.description,
  image: listing.image,
  rating: Number((listing.rating || 0).toFixed(1)),
  reviews: listing.reviews || 0
});

const getMarketplaceListings = async (filters = {}) => {
  const { page = 1, limit = 10, sortBy, order } = filters;
  const query = buildMarketplaceFilters(filters);
  const skip = (Number(page) - 1) * Number(limit);

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate('farmer', 'name')
      .sort(buildSort(sortBy, order))
      .skip(skip)
      .limit(Number(limit)),
    Listing.countDocuments(query)
  ]);

  return {
    listings: listings.map(mapListingCard),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1
    }
  };
};

const getListingById = async (listingId) => {
  const listing = await Listing.findById(listingId)
    .populate('farmer', 'name email');

  if (!listing) {
    throw new Error('Listing not found');
  }

  const reviews = await Review.find({ listing: listingId })
    .populate('consumer', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    id: listing._id,
    name: listing.name,
    farmer: {
      id: listing.farmer?._id,
      name: listing.farmer?.name || '',
      location: listing.location,
      rating: Number((listing.rating || 0).toFixed(1))
    },
    location: listing.location,
    price: listing.price,
    unit: listing.unit,
    quantity: listing.quantity,
    category: listing.category,
    description: listing.description,
    images: listing.images || [],
    rating: Number((listing.rating || 0).toFixed(1)),
    reviews: listing.reviews || 0,
    reviewList: reviews.map((review) => ({
      id: review._id,
      consumer: review.consumer?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt
    }))
  };
};

const getMyListings = async (farmerId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const [listings, total] = await Promise.all([
    Listing.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('crop', 'isAvailable'),
    Listing.countDocuments({ farmer: farmerId })
  ]);

  return {
    listings: listings.map((listing) => ({
      id: listing._id,
      cropId: listing.crop?._id || listing.crop,
      name: listing.name,
      price: listing.price,
      quantity: listing.quantity,
      status: listing.status,
      rating: Number((listing.rating || 0).toFixed(1)),
      reviews: listing.reviews || 0,
      totalSalesQuantity: listing.totalSalesQuantity || 0,
      totalRevenue: listing.totalRevenue || 0,
      isAvailable: listing.crop?.isAvailable
    })),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1
    }
  };
};

module.exports = {
  getMarketplaceListings,
  getListingById,
  getMyListings
};
