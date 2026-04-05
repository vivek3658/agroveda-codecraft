const express = require('express');
const { 
  createCrop, 
  getAllCrops, 
  getCropById, 
  updateCrop, 
  deleteCrop,
  getMyCrops 
} = require('../controllers/crop.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/crops:
 *   get:
 *     summary: Get all crops (Marketplace)
 *     tags: [Crops]
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
 *         schema: { type: string, enum: [Grains, Vegetables, Fruits, Legumes, Spices, Other] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: List of crops with pagination
 */
router.get('/', getAllCrops);

/**
 * @swagger
 * /api/crops/{id}:
 *   get:
 *     summary: Get a crop by ID
 *     tags: [Crops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Crop data
 *       404:
 *         description: Crop not found
 */
router.get('/:id', getCropById);

/**
 * @swagger
 * /api/crops:
 *   post:
 *     summary: Create a new crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, description, price, quantity, location]
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               quantity: { type: number }
 *               unit: { type: string }
 *               location: { type: string }
 *     responses:
 *       201:
 *         description: Crop created successfully
 */
router.post('/', protect, authorize('farmer'), createCrop);

/**
 * @swagger
 * /api/crops/my/all:
 *   get:
 *     summary: Get all crops owned by current farmer
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: List of farmer's crops with pagination
 */
router.get('/my/all', protect, authorize('farmer'), getMyCrops);

/**
 * @swagger
 * /api/crops/{id}:
 *   put:
 *     summary: Update a crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               quantity: { type: number }
 *               isAvailable: { type: boolean }
 *     responses:
 *       200:
 *         description: Crop updated successfully
 */
router.put('/:id', protect, authorize('farmer'), updateCrop);

/**
 * @swagger
 * /api/crops/{id}:
 *   delete:
 *     summary: Delete a crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Crop deleted successfully
 */
router.delete('/:id', protect, authorize('farmer'), deleteCrop);

module.exports = router;
