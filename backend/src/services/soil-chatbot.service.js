const fs = require('fs');
const path = require('path');
const ChatSession = require('../models/ChatSession');
const SoilPrediction = require('../models/SoilPrediction');
const { runPythonSoilCommand } = require('./python-bridge.service');

const buildSessionTitle = (title, predictionDoc) => {
  if (title && title.trim()) {
    return title.trim();
  }

  const topCrop = predictionDoc?.predictions?.[0]?.crop;
  if (topCrop) {
    return `Soil Assistant - ${topCrop}`;
  }

  return 'Soil Assistant Chat';
};

const buildAssistantReply = (predictionDoc, userMessage = '') => {
  const topCrop = predictionDoc.predictions?.[0];
  const extracted = predictionDoc.extractedData || {};

  const lines = [];
  if (topCrop) {
    lines.push(`Top recommendation is ${topCrop.crop} with confidence ${Math.round(topCrop.confidence * 100)}%.`);
  }
  lines.push(`Observed soil profile: N ${extracted.N}, P ${extracted.P}, K ${extracted.K}, pH ${extracted.ph}, rainfall ${extracted.rainfall}.`);

  if (predictionDoc.predictions?.length > 1) {
    const alternatives = predictionDoc.predictions.slice(1).map((item) => item.crop).join(', ');
    lines.push(`Alternative suitable crops: ${alternatives}.`);
  }

  if (userMessage) {
    lines.push(`Your question: "${userMessage}"`);
  }

  lines.push('Suggested next step: compare the top crop with your season, water availability, and local market demand.');
  return lines.join(' ');
};

const createChatSession = async (userId, title = '') => {
  return ChatSession.create({
    user: userId,
    title: buildSessionTitle(title),
    messages: []
  });
};

const savePrediction = async ({ userId, sourceType, originalInput, pythonResult, fileMeta }) => {
  const prediction = await SoilPrediction.create({
    user: userId || undefined,
    sourceType,
    originalInput,
    extractedData: pythonResult.extracted || originalInput,
    predictions: pythonResult.top_3 || [],
    rawText: pythonResult.raw_text || '',
    fileMeta
  });

  return prediction;
};

const predictFromJson = async (userId, payload) => {
  const result = await runPythonSoilCommand(['predict-json', JSON.stringify(payload)]);
  const prediction = await savePrediction({
    userId,
    sourceType: 'json',
    originalInput: payload,
    pythonResult: result
  });

  return {
    prediction,
    chatbotReply: buildAssistantReply(prediction)
  };
};

const predictFromFile = async (userId, file) => {
  const result = await runPythonSoilCommand(['predict-file', file.path]);
  const prediction = await savePrediction({
    userId,
    sourceType: file.mimetype === 'application/pdf' ? 'pdf' : 'image',
    originalInput: {
      filePath: file.path
    },
    pythonResult: result,
    fileMeta: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }
  });

  try {
    fs.unlinkSync(file.path);
  } catch (error) {
    console.warn('Temporary upload cleanup failed:', error.message);
  }

  return {
    prediction,
    chatbotReply: buildAssistantReply(prediction)
  };
};

const createChatMessage = async (userId, payload) => {
  const { sessionId, message, predictionId } = payload;
  if (!message || !String(message).trim()) {
    throw new Error('Message is required');
  }

  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, user: userId });
  }

  if (!session) {
    session = await createChatSession(userId, '');
  }

  const prediction = predictionId ? await SoilPrediction.findOne({ _id: predictionId, user: userId }) : null;
  const assistantMessage = prediction
    ? buildAssistantReply(prediction, message)
    : 'Share soil values or upload an image/PDF report, and I will recommend the most suitable crops and explain why.';

  session.messages.push({ role: 'user', message, metadata: prediction ? { predictionId } : {} });
  session.messages.push({
    role: 'assistant',
    message: assistantMessage,
    metadata: prediction ? { predictionId, recommendedCrops: prediction.predictions } : {}
  });

  if (prediction) {
    session.lastPrediction = prediction._id;
    if (!session.title || session.title === 'Soil Assistant Chat') {
      session.title = buildSessionTitle('', prediction);
    }
  }

  await session.save();
  return session;
};

const getChatSessions = async (userId) => {
  return ChatSession.find({ user: userId })
    .sort({ updatedAt: -1 })
    .select('title lastPrediction updatedAt createdAt');
};

const getChatSessionById = async (userId, sessionId) => {
  const session = await ChatSession.findOne({ _id: sessionId, user: userId }).populate('lastPrediction');
  if (!session) {
    throw new Error('Chat session not found');
  }
  return session;
};

const getMyPredictions = async (userId) => {
  return SoilPrediction.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
};

module.exports = {
  createChatSession,
  predictFromJson,
  predictFromFile,
  createChatMessage,
  getChatSessions,
  getChatSessionById,
  getMyPredictions
};
