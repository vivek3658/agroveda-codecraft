const express = require('express');
const { createReview } = require('../controllers/review.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a purchased marketplace item
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateRequest'
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post('/', protect, authorize('consumer'), createReview);

module.exports = router;
