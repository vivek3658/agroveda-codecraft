import { requestFormData, requestJson, unwrapData } from "./apiClient";

const normalizeExtracted = (extracted = {}) => ({
  N: extracted.N,
  P: extracted.P,
  K: extracted.K,
  temperature: extracted.temperature,
  humidity: extracted.humidity,
  rainfall: extracted.rainfall,
  ph: extracted.ph,
});

const normalizeRecommendation = (item, index) => ({
  id: item?._id || item?.id || `${item?.crop || "crop"}-${index}`,
  crop: item?.crop || "Unknown crop",
  confidence: item?.confidence ?? 0,
});

const normalizePredictionResponse = (payload) => {
  const data = unwrapData(payload);

  return {
    id: data?.predictionId || data?._id || data?.id || null,
    extracted: normalizeExtracted(data?.extracted || {}),
    recommendations: (data?.recommendations || []).map(normalizeRecommendation),
    chatbotReply: data?.chatbotReply || "",
    raw: payload,
  };
};

const normalizePredictionHistoryItem = (item) => ({
  id: item?._id || item?.id,
  sourceType: item?.sourceType || "json",
  extracted: normalizeExtracted(item?.extractedData || {}),
  recommendations: (item?.predictions || []).map(normalizeRecommendation),
  createdAt: item?.createdAt || null,
  raw: item,
});

const normalizeMessage = (message, index) => ({
  id: message?._id || `${message?.role || "message"}-${index}`,
  role: message?.role || "assistant",
  message: message?.message || "",
  metadata: message?.metadata || {},
  createdAt:
    message?.createdAt ||
    message?.metadata?.createdAt ||
    message?.metadata?.timestamp ||
    null,
});

const normalizeSession = (payload) => {
  const data = unwrapData(payload);

  return {
    id: data?._id || data?.id || null,
    title: data?.title || "Soil Assistant Chat",
    updatedAt: data?.updatedAt || data?.createdAt || null,
    predictionId: data?.predictionId || data?.metadata?.predictionId || null,
    messages: (data?.messages || []).map(normalizeMessage),
    raw: data,
  };
};

export const createChatSession = async (token, body = {}) => {
  const payload = await requestJson("/chatbot/sessions", {
    method: "POST",
    token,
    body,
  });

  return normalizeSession(payload);
};

export const getChatSessions = async (token) => {
  const payload = await requestJson("/chatbot/sessions", { token });
  const data = unwrapData(payload);
  return (Array.isArray(data) ? data : []).map((item) => ({
    id: item?._id || item?.id,
    title: item?.title || "Soil Assistant Chat",
    updatedAt: item?.updatedAt || item?.createdAt || null,
    predictionId: item?.predictionId || item?.metadata?.predictionId || null,
    raw: item,
  }));
};

export const getChatSessionById = async (token, sessionId) => {
  const payload = await requestJson(`/chatbot/sessions/${sessionId}`, { token });
  return normalizeSession(payload);
};

export const sendChatMessage = async (token, body) => {
  const payload = await requestJson("/chatbot/message", {
    method: "POST",
    token,
    body,
  });

  return normalizeSession(payload);
};

export const persistChatMessage = async (token, body) => {
  return sendChatMessage(token, body);
};

export const predictFromManualInput = async (token, values) => {
  const payload = await requestJson("/chatbot/predict", {
    method: "POST",
    token,
    body: values,
  });

  const normalized = normalizePredictionResponse(payload);
  return {
    ...normalized,
    extracted: {
      ...values,
      ...normalized.extracted,
    },
  };
};

export const uploadSoilFile = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await requestFormData("/chatbot/upload", {
    method: "POST",
    token,
    formData,
  });

  return normalizePredictionResponse(payload);
};

export const getPredictionHistory = async (token) => {
  const payload = await requestJson("/chatbot/predictions", { token });
  const data = unwrapData(payload);
  return (Array.isArray(data) ? data : []).map(normalizePredictionHistoryItem);
};
