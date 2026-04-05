const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Review = require('../models/Review');

const recalculateListingReviewStats = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: '$listing',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const rating = stats[0]?.avgRating || 0;
  const reviews = stats[0]?.totalReviews || 0;

  await Listing.findByIdAndUpdate(listingId, { rating, reviews });
};

const createReview = async (consumerId, payload) => {
  const { orderId, listingId, rating, comment } = payload;

  const order = await Order.findOne({ _id: orderId, consumer: consumerId });
  if (!order) {
    throw new Error('Order not found');
  }

  const item = order.items.find((entry) => entry.listing.toString() === listingId);
  if (!item) {
    throw new Error('Listing not found in order');
  }

  const review = await Review.create({
    listing: item.listing,
    crop: item.crop,
    order: order._id,
    farmer: item.farmer,
    consumer: consumerId,
    rating,
    comment
  });

  await recalculateListingReviewStats(item.listing);

  return review;
};

module.exports = {
  createReview
};
