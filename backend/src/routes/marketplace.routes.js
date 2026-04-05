const express = require('express');
const { getListings, getListingById, getMyListings } = require('../controllers/marketplace.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/marketplace:
 *   get:
 *     summary: Get published marketplace listings
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [price, rating, createdAt] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Marketplace listing cards
 */
router.get('/', getListings);

/**
 * @swagger
 * /api/marketplace/my/listings:
 *   get:
 *     summary: Get current farmer marketplace listings
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer marketplace listings
 */
router.get('/my/listings', protect, authorize('farmer'), getMyListings);

/**
 * @swagger
 * /api/marketplace/{id}:
 *   get:
 *     summary: Get marketplace listing details
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Listing detail
 */
router.get('/:id', getListingById);

module.exports = router;
