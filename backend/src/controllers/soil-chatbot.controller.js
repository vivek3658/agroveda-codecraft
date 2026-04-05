const soilChatbotService = require('../services/soil-chatbot.service');

const predictFromJson = async (req, res) => {
  try {
    const result = await soilChatbotService.predictFromJson(req.user?.id, req.body);
    res.status(200).json({
      success: true,
      data: {
        predictionId: result.prediction._id,
        extracted: result.prediction.extractedData,
        top_3: result.prediction.predictions,
        chatbotReply: result.chatbotReply
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const predictFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const result = await soilChatbotService.predictFromFile(req.user?.id, req.file);
    res.status(200).json({
      success: true,
      data: {
        predictionId: result.prediction._id,
        extracted: result.prediction.extractedData,
        top_3: result.prediction.predictions,
        chatbotReply: result.chatbotReply
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createChatMessage = async (req, res) => {
  try {
    const session = await soilChatbotService.createChatMessage(req.user.id, req.body);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyChatSessions = async (req, res) => {
  try {
    const sessions = await soilChatbotService.getChatSessions(req.user.id);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChatSessionById = async (req, res) => {
  try {
    const session = await soilChatbotService.getChatSessionById(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getMyPredictions = async (req, res) => {
  try {
    const predictions = await soilChatbotService.getMyPredictions(req.user.id);
    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  predictFromJson,
  predictFromFile,
  createChatMessage,
  getMyChatSessions,
  getChatSessionById,
  getMyPredictions
};
