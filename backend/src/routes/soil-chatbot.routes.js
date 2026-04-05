const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/auth.middleware');
const {
  predictFromJson,
  predictFromFile,
  createChatMessage,
  getMyChatSessions,
  getChatSessionById,
  getMyPredictions
} = require('../controllers/soil-chatbot.controller');

const router = express.Router();

const os = require('os');
const uploadDir = path.join(os.tmpdir(), 'soil-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/soil-chatbot/predict:
 *   post:
 *     summary: Predict suitable crops from manual soil JSON values
 *     tags: [Soil Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prediction generated successfully
 */
router.post('/predict', protect, predictFromJson);

/**
 * @swagger
 * /api/soil-chatbot/upload:
 *   post:
 *     summary: Predict suitable crops from soil report image or PDF
 *     tags: [Soil Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File processed successfully
 */
router.post('/upload', protect, upload.single('file'), predictFromFile);

router.post('/chat', protect, createChatMessage);
router.get('/sessions', protect, getMyChatSessions);
router.get('/sessions/:id', protect, getChatSessionById);
router.get('/predictions', protect, getMyPredictions);

module.exports = router;
