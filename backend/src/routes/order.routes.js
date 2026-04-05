const express = require('express');
const { createOrder, getMyOrders, getOrderById } = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order from marketplace listings
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/', protect, authorize('consumer', 'farmer'), createOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get current consumer order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consumer orders fetched successfully
 */
router.get('/my-orders', protect, authorize('consumer', 'farmer'), getMyOrders);
router.get('/:id', protect, authorize('consumer', 'farmer'), getOrderById);

module.exports = router;
