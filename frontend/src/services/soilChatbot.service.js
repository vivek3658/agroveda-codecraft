import { requestFormData, requestJson, unwrapData } from "../api/apiClient";

const pickFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const removeEmptyFields = (source) =>
  Object.fromEntries(
    Object.entries(source || {}).filter(([, value]) => value !== undefined && value !== null)
  );

const normalizeExtractedValues = (source) => {
  if (!source || typeof source !== "object") {
    return null;
  }

  const normalized = removeEmptyFields({
    N: pickFirstDefined(source.N, source.n, source.nitrogen, source.nitrogen_value),
    P: pickFirstDefined(source.P, source.p, source.phosphorus, source.phosphorus_value),
    K: pickFirstDefined(source.K, source.k, source.potassium, source.potassium_value),
    temperature: pickFirstDefined(
      source.temperature,
      source.temp,
      source.temp_c,
      source.temperature_c,
      source.avg_temperature
    ),
    humidity: pickFirstDefined(
      source.humidity,
      source.humid,
      source.humidity_percent,
      source.relative_humidity,
      source.moisture
    ),
    rainfall: pickFirstDefined(source.rainfall, source.rain, source.rain_fall),
    ph: pickFirstDefined(source.ph, source.pH, source.ph_value, source.soil_ph),
  });

  return Object.keys(normalized).length ? normalized : null;
};

const parseObservedValuesFromSummary = (summary) => {
  if (!summary) {
    return null;
  }

  const patterns = {
    N: /N\s+([0-9]+(?:\.[0-9]+)?)/i,
    P: /P\s+([0-9]+(?:\.[0-9]+)?)/i,
    K: /K\s+([0-9]+(?:\.[0-9]+)?)/i,
    ph: /pH\s+([0-9]+(?:\.[0-9]+)?)/i,
    rainfall: /rainfall\s+([0-9]+(?:\.[0-9]+)?)/i,
    temperature: /temperature\s+([0-9]+(?:\.[0-9]+)?)/i,
    humidity: /humidity\s+([0-9]+(?:\.[0-9]+)?)/i,
  };

  const values = {};

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = summary.match(pattern);
    if (match) {
      values[key] = Number(match[1]);
    }
  });

  return Object.keys(values).length ? values : null;
};

const parseBestCropFromSummary = (summary) => {
  if (!summary) {
    return null;
  }

  const match = summary.match(/top recommendation is\s+([a-z][a-z\s-]*)\s+with confidence/i);
  return match ? match[1].trim() : null;
};

const parseConfidenceFromSummary = (summary) => {
  if (!summary) {
    return null;
  }

  const match = summary.match(/confidence\s+([0-9]+(?:\.[0-9]+)?)%/i);
  return match ? Number(match[1]) : null;
};

const parseAlternativeCropsFromSummary = (summary) => {
  if (!summary) {
    return [];
  }

  const match = summary.match(/alternative suitable crops:\s*([^.]*)/i);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeRecommendationItem = (item) => {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    return {
      name: item,
      confidence: null,
    };
  }

  return {
    id: item.id || item._id || null,
    name:
      item.name ||
      item.crop ||
      item.label ||
      item.predictedCrop ||
      item.predicted_crop ||
      null,
    confidence:
      item.confidence ??
      item.score ??
      item.percentage ??
      item.probability ??
      item.probability_percent ??
      null,
  };
};

const extractRecommendations = (data, payload, summary) => {
  const rawRecommendations =
    data?.top_3 ||
    data?.recommendations ||
    data?.topRecommendations ||
    data?.top3 ||
    data?.top_3_predictions ||
    data?.topPredictions ||
    data?.predictions ||
    data?.crops ||
    payload?.top_3 ||
    payload?.recommendations ||
    payload?.top3 ||
    payload?.top_3_predictions ||
    payload?.predictions ||
    [];

  if (Array.isArray(rawRecommendations) && rawRecommendations.length) {
    return rawRecommendations.map(normalizeRecommendationItem).filter(Boolean);
  }

  const bestCrop = parseBestCropFromSummary(summary);
  const confidence = parseConfidenceFromSummary(summary);
  const alternatives = parseAlternativeCropsFromSummary(summary);

  if (!bestCrop) {
    return [];
  }

  return [
    { name: bestCrop, confidence },
    ...alternatives.map((name) => ({ name, confidence: null })),
  ];
};

const normalizePrediction = (payload) => {
  const data = unwrapData(payload, ["prediction", "result"]);
  const summary =
    data?.summary ||
    data?.chatbotReply ||
    data?.chatbot_reply ||
    data?.message ||
    payload?.summary ||
    payload?.chatbotReply ||
    payload?.chatbot_reply ||
    payload?.message ||
    "";
  const structuredValues =
    normalizeExtractedValues(data?.extracted) ||
    normalizeExtractedValues(data?.extractedData) ||
    normalizeExtractedValues(data?.extractedValues) ||
    normalizeExtractedValues(data?.soilValues) ||
    normalizeExtractedValues(data?.soil_data) ||
    normalizeExtractedValues(data?.soilData) ||
    normalizeExtractedValues(data?.values) ||
    normalizeExtractedValues(data?.input) ||
    normalizeExtractedValues(data?.features) ||
    normalizeExtractedValues(payload?.extracted) ||
    normalizeExtractedValues(payload?.extractedData) ||
    normalizeExtractedValues(payload?.extractedValues) ||
    normalizeExtractedValues(payload?.soilValues) ||
    normalizeExtractedValues(payload?.soil_data) ||
    normalizeExtractedValues(payload?.soilData) ||
    normalizeExtractedValues(payload?.values) ||
    normalizeExtractedValues(payload?.input) ||
    normalizeExtractedValues(payload?.features) ||
    null;
  const fallbackValues = removeEmptyFields({
    N: pickFirstDefined(data?.N, data?.n, data?.nitrogen, payload?.N, payload?.n, payload?.nitrogen),
    P: pickFirstDefined(data?.P, data?.p, data?.phosphorus, payload?.P, payload?.p, payload?.phosphorus),
    K: pickFirstDefined(data?.K, data?.k, data?.potassium, payload?.K, payload?.k, payload?.potassium),
    temperature: pickFirstDefined(
      data?.temperature,
      data?.temp,
      data?.temp_c,
      data?.temperature_c,
      payload?.temperature,
      payload?.temp,
      payload?.temp_c,
      payload?.temperature_c
    ),
    humidity: pickFirstDefined(
      data?.humidity,
      data?.humid,
      data?.humidity_percent,
      data?.relative_humidity,
      payload?.humidity,
      payload?.humid,
      payload?.humidity_percent,
      payload?.relative_humidity
    ),
    rainfall: pickFirstDefined(data?.rainfall, data?.rain, payload?.rainfall, payload?.rain),
    ph: pickFirstDefined(data?.ph, data?.pH, data?.ph_value, payload?.ph, payload?.pH, payload?.ph_value),
  });
  const parsedValues = parseObservedValuesFromSummary(summary);
  const extractedValues =
    structuredValues ||
    (Object.keys(fallbackValues).length ? fallbackValues : null) ||
    parsedValues;
  const recommendations = extractRecommendations(data, payload, summary);
  const bestCrop =
    data?.bestCrop ||
    data?.recommendedCrop ||
    data?.recommended_crop ||
    data?.predictedCrop ||
    data?.predicted_crop ||
    data?.top_3?.[0]?.crop ||
    data?.top_3?.[0]?.name ||
    data?.top3?.[0]?.crop ||
    data?.topCrop ||
    payload?.bestCrop ||
    payload?.top_3?.[0]?.crop ||
    payload?.top_3?.[0]?.name ||
    parseBestCropFromSummary(summary) ||
    recommendations[0]?.name ||
    null;

  return {
    id: data?.id || data?._id || payload?.predictionId || payload?.id || null,
    sourceType: data?.sourceType || payload?.sourceType || "json",
    createdAt: data?.createdAt || payload?.createdAt || null,
    extractedValues,
    bestCrop,
    recommendations,
    summary,
    sessionId:
      data?.sessionId ||
      payload?.sessionId ||
      data?.chatSessionId ||
      null,
    raw: payload,
  };
};

const normalizeSession = (payload) => {
  const data = unwrapData(payload, ["session"]);
  return {
    id: data?.id || data?._id || payload?.id || null,
    title: data?.title || data?.subject || "Soil Assistant Session",
    predictionId: data?.predictionId || null,
    messages: data?.messages || payload?.messages || [],
    createdAt: data?.createdAt || payload?.createdAt || null,
    raw: payload,
  };
};

const normalizeChatMessage = (message, index) => ({
  id: message?.id || message?._id || `${message?.role || "message"}-${index}`,
  role: message?.role || "assistant",
  content: message?.content || message?.message || "",
  message: message?.message || message?.content || "",
  createdAt:
    message?.createdAt ||
    message?.timestamp ||
    message?.metadata?.createdAt ||
    null,
  raw: message,
});

export const predictSoilFromManualData = async (token, values) => {
  const payload = await requestJson("/soil-chatbot/predict", {
    method: "POST",
    token,
    body: values,
  });

  const normalized = normalizePrediction(payload);

  return {
    ...normalized,
    extractedValues: removeEmptyFields({
      ...values,
      ...(normalized.extractedValues || {}),
    }),
  };
};

export const uploadSoilReportFile = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await requestFormData("/soil-chatbot/upload", {
    method: "POST",
    token,
    formData,
  });

  return normalizePrediction(payload);
};

export const sendSoilChatMessage = async (token, body) => {
  const payload = await requestJson("/soil-chatbot/chat", {
    method: "POST",
    token,
    body,
  });

  const data = unwrapData(payload, ["message", "reply"]);

  return {
    reply:
      data?.reply ||
      data?.message ||
      payload?.reply ||
      payload?.message ||
      "",
    sessionId:
      data?.sessionId ||
      payload?.sessionId ||
      data?.id ||
      null,
    messages: (data?.messages || payload?.messages || []).map(normalizeChatMessage),
    raw: payload,
  };
};

export const getSoilChatSessions = async (token) => {
  const payload = await requestJson("/soil-chatbot/sessions", {
    token,
  });

  const data = unwrapData(payload, ["sessions", "items"]);
  const sessions = Array.isArray(data) ? data : data?.sessions || payload?.sessions || [];
  return sessions.map((session) => normalizeSession(session));
};

export const getSoilChatSessionById = async (token, sessionId) => {
  const payload = await requestJson(`/soil-chatbot/sessions/${sessionId}`, {
    token,
  });

  return normalizeSession(payload);
};

export const getSoilPredictions = async (token) => {
  const payload = await requestJson("/soil-chatbot/predictions", {
    token,
  });

  const data = unwrapData(payload, ["predictions", "items"]);
  const predictions = Array.isArray(data)
    ? data
    : data?.predictions || payload?.predictions || payload?.items || [];

  return predictions.map((prediction) => normalizePrediction(prediction));
};
