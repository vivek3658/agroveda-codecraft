import { useState } from "react";
import {
  getSoilChatSessionById,
  sendSoilChatMessage,
} from "../../../services/soilChatbot.service";
import { generateGeminiReply } from "../../../services/geminiChat.service";

const buildAssistantMessage = (content, prediction) => {
  if (content) {
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
    };
  }

  if (!prediction?.summary) {
    return null;
  }

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: prediction.summary,
    createdAt: new Date().toISOString(),
  };
};

export const useSoilChat = (token) => {
  const [sessionId, setSessionId] = useState(null);
  const [predictionId, setPredictionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bindPrediction = (prediction) => {
    setSessionId(prediction?.sessionId || null);
    setPredictionId(prediction?.id || null);
    setError("");

    const assistantMessage = buildAssistantMessage("", prediction);
    setMessages(assistantMessage ? [assistantMessage] : []);
  };

  const loadSession = async (nextSessionId) => {
    if (!nextSessionId) {
      return null;
    }

    setLoading(true);
    setError("");
    try {
      const session = await getSoilChatSessionById(token, nextSessionId);
      setSessionId(session.id || nextSessionId);
      setPredictionId(session.predictionId || null);
      setMessages(session.messages || []);
      return session;
    } catch (err) {
      setError(err.message || "Unable to load the selected chat session.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    const trimmed = content.trim();

    if (!trimmed) {
      return null;
    }

    const optimisticUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setLoading(true);
    setError("");

    try {
      const gemini = await generateGeminiReply({
        message: trimmed,
        messages,
        prediction: {
          id: predictionId,
          sessionId,
          summary: messages.find((message) => message.role !== "user")?.content || "",
        },
      });

      const response = await sendSoilChatMessage(token, {
        message: trimmed,
        sessionId,
        predictionId,
        assistantReply: gemini.reply,
        provider: "gemini",
        model: gemini.model,
      });

      setSessionId(response.sessionId || sessionId || null);

      if (response.messages?.length) {
        setMessages(response.messages);
      } else {
        const assistantMessage = buildAssistantMessage(response.reply || gemini.reply, null);
        setMessages((prev) => (assistantMessage ? [...prev, assistantMessage] : prev));
      }

      return response;
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticUserMessage.id));
      setError(err.message || "Unable to send your question right now.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sessionId,
    predictionId,
    messages,
    loading,
    error,
    bindPrediction,
    loadSession,
    sendMessage,
  };
};
