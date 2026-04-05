const reviewService = require('../services/review.service');

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview
};
