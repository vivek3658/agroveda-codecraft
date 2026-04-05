const express = require('express');
const { register, login, googleLogin, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, reEnterPassword, role, captcha]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               reEnterPassword: { type: string }
 *               role: { type: string, enum: [farmer, consumer] }
 *               captcha: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, captcha]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               captcha: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string }
 *               role: { type: string }
 *     responses:
 *       200:
 *         description: Google Login successful
 */
router.post('/google', googleLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

module.exports = router;
