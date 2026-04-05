const express = require('express');
const { getFarmerOverview } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/farmer/overview:
 *   get:
 *     summary: Get farmer dashboard analytics overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer analytics overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/FarmerAnalyticsOverview'
 */
router.get('/farmer/overview', protect, authorize('farmer'), getFarmerOverview);

module.exports = router;
