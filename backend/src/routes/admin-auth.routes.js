const express = require('express');
const { loginAdmin } = require('../controllers/admin-auth.controller');
const { validateRequiredFields } = require('../middlewares/validate.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login with prebuilt admin credentials
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: admin }
 *               password: { type: string, example: Admin@123 }
 *     responses:
 *       200:
 *         description: Admin login successful
 */
router.post('/login', validateRequiredFields(['username', 'password']), loginAdmin);

module.exports = router;
