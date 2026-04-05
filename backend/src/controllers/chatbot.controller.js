const soilChatbotService = require('../services/soil-chatbot.service');

const mapPredictionPayload = (result) => ({
  predictionId: result.prediction._id,
  extracted: result.prediction.extractedData,
  recommendations: result.prediction.predictions,
  chatbotReply: result.chatbotReply
});

const startChatbotSession = async (req, res) => {
  try {
    const session = await soilChatbotService.createChatSession(req.user.id, req.body?.title);
    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      data: session
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendChatbotMessage = async (req, res) => {
  try {
    const session = await soilChatbotService.createChatMessage(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Chatbot response generated successfully',
      data: session
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getChatbotSessions = async (req, res) => {
  try {
    const sessions = await soilChatbotService.getChatSessions(req.user.id);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChatbotSessionById = async (req, res) => {
  try {
    const session = await soilChatbotService.getChatSessionById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getChatbotPredictions = async (req, res) => {
  try {
    const predictions = await soilChatbotService.getMyPredictions(req.user.id);
    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const predictChatbotFromJson = async (req, res) => {
  try {
    const result = await soilChatbotService.predictFromJson(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Prediction generated successfully',
      data: mapPredictionPayload(result)
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const predictChatbotFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const result = await soilChatbotService.predictFromFile(req.user.id, req.file);
    res.status(200).json({
      success: true,
      message: 'File processed successfully',
      data: mapPredictionPayload(result)
    });
  } catch (error) {
    const userMessage = error.message.includes('Tesseract') || error.message.includes('tesseract')
      ? 'Image OCR is unavailable. Please ensure Tesseract OCR is installed and the server has been restarted.'
      : error.message;

    res.status(400).json({ success: false, message: userMessage });
  }
};

module.exports = {
  startChatbotSession,
  sendChatbotMessage,
  getChatbotSessions,
  getChatbotSessionById,
  getChatbotPredictions,
  predictChatbotFromJson,
  predictChatbotFromFile
};
