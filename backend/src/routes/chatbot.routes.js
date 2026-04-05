const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/auth.middleware');
const {
  startChatbotSession,
  sendChatbotMessage,
  getChatbotSessions,
  getChatbotSessionById,
  getChatbotPredictions,
  predictChatbotFromJson,
  predictChatbotFromFile
} = require('../controllers/chatbot.controller');

const router = express.Router();

const os = require('os');
const uploadDir = path.join(os.tmpdir(), 'chatbot-uploads');
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
 * /api/chatbot/sessions:
 *   post:
 *     summary: Start a new chatbot session
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Chat session created successfully
 *   get:
 *     summary: List chatbot sessions for the current user
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat sessions fetched successfully
 */
router.post('/sessions', protect, startChatbotSession);
router.get('/sessions', protect, getChatbotSessions);

/**
 * @swagger
 * /api/chatbot/sessions/{id}:
 *   get:
 *     summary: Get one chatbot session with messages
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chat session fetched successfully
 */
router.get('/sessions/:id', protect, getChatbotSessionById);

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Send a message to the chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chatbot reply generated successfully
 */
router.post('/message', protect, sendChatbotMessage);

/**
 * @swagger
 * /api/chatbot/predict:
 *   post:
 *     summary: Create a chatbot prediction from manual soil values
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chatbot prediction generated successfully
 */
router.post('/predict', protect, predictChatbotFromJson);

/**
 * @swagger
 * /api/chatbot/upload:
 *   post:
 *     summary: Create a chatbot prediction from image or PDF upload
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chatbot upload processed successfully
 */
router.post('/upload', protect, upload.single('file'), predictChatbotFromFile);

/**
 * @swagger
 * /api/chatbot/predictions:
 *   get:
 *     summary: List chatbot prediction history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prediction history fetched successfully
 */
router.get('/predictions', protect, getChatbotPredictions);

module.exports = router;
