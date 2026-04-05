import { useState } from "react";
import { sendChatMessage } from "../../../services/chatbot.service";
import { generateGeminiReply } from "../../../services/geminiChat.service";

export const useChatbotMessages = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildLocalMessage = (role, message) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    message,
    createdAt: new Date().toISOString(),
    metadata: {},
  });

  const sendMessage = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const gemini = await generateGeminiReply({
        message: payload.message,
        messages: payload.messages,
        prediction: payload.prediction,
      });

      const session = await sendChatMessage(token, {
        ...payload,
        assistantReply: gemini.reply,
        provider: "gemini",
        model: gemini.model,
      });

      const nextSession =
        session?.messages?.length
          ? session
          : {
              ...session,
              messages: [
                ...(payload.messages || []),
                buildLocalMessage("user", payload.message),
                buildLocalMessage("assistant", gemini.reply),
              ],
            };

      onSuccess?.(nextSession);
      return nextSession;
    } catch (err) {
      setError(err.message || "Unable to send message.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendMessage,
  };
};
