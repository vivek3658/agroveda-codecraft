const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

const getProviderApiKey = () => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (envKey) {
    return envKey;
  }

  if (typeof window !== "undefined") {
    return (
      window.localStorage.getItem("VITE_GEMINI_API_KEY") ||
      window.sessionStorage.getItem("VITE_GEMINI_API_KEY") ||
      ""
    );
  }

  return "";
};

const formatPredictionContext = (prediction) => {
  if (!prediction) {
    return "No soil prediction context is available yet.";
  }

  const extracted = prediction.extracted || prediction.extractedValues || {};
  const recommendations = prediction.recommendations || [];
  const topRecommendations = recommendations
    .slice(0, 3)
    .map((item, index) => {
      const crop = item.crop || item.name || `Crop ${index + 1}`;
      const confidence = item.confidence ?? "unknown";
      return `${index + 1}. ${crop} (confidence: ${confidence})`;
    })
    .join("\n");

  return [
    "Soil analysis context:",
    `Prediction ID: ${prediction.id || "unknown"}`,
    `Summary: ${prediction.chatbotReply || prediction.summary || "No summary available."}`,
    `Observed values: ${JSON.stringify(extracted)}`,
    `Recommendations:\n${topRecommendations || "No recommendations returned."}`,
  ].join("\n");
};

const formatHistory = (messages = []) =>
  messages
    .slice(-8)
    .map((message) => {
      const role = message.role === "user" ? "User" : "Assistant";
      return `${role}: ${message.message || message.content || ""}`;
    })
    .filter(Boolean)
    .join("\n");

export const generateGeminiReply = async ({
  message,
  messages = [],
  prediction,
  systemInstruction,
}) => {
  const apiKey = getProviderApiKey();

  if (!apiKey) {
    throw new Error(
      "Gemini is not configured. Add VITE_GEMINI_API_KEY to .env and restart Vite, or set localStorage.VITE_GEMINI_API_KEY in the browser."
    );
  }

  const prompt = [
    systemInstruction ||
      "You are an agriculture assistant. Give practical, concise soil and crop guidance. Use the provided soil context when available. If data is missing, say so clearly instead of inventing values.",
    "",
    formatPredictionContext(prediction),
    "",
    "Recent conversation:",
    formatHistory(messages) || "No earlier messages.",
    "",
    `Latest user question: ${message}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 600,
        },
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.error?.message || payload?.message || "Gemini request failed."
    );
  }

  const reply =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || "";

  if (!reply) {
    throw new Error("Gemini returned an empty reply.");
  }

  return {
    reply,
    model: GEMINI_MODEL,
    raw: payload,
  };
};
