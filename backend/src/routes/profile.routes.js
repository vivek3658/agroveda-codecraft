const express = require('express');
const { getMyProfile, updateMyProfile, deleteMyProfile } = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 */
router.get('/me', protect, getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Create or update current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *               pincode: { type: string }
 *               farmSize: { type: string }
 *               experience: { type: string }
 *               specialization: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', protect, updateMyProfile);
router.delete('/me', protect, deleteMyProfile);

module.exports = router;
