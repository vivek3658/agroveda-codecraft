import { useCallback, useEffect, useState } from "react";
import {
  createChatSession,
  getChatSessionById,
  getChatSessions,
} from "../../../services/chatbot.service";

export const useChatbotSessions = (token) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingActiveSession, setLoadingActiveSession] = useState(false);
  const [error, setError] = useState("");

  const refreshSessions = useCallback(async () => {
    if (!token) {
      setSessions([]);
      setLoadingSessions(false);
      return [];
    }

    setLoadingSessions(true);
    try {
      const data = await getChatSessions(token);
      setSessions(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message || "Unable to load chat sessions.");
      throw err;
    } finally {
      setLoadingSessions(false);
    }
  }, [token]);

  const loadSession = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        setActiveSession(null);
        return null;
      }

      setLoadingActiveSession(true);
      try {
        const data = await getChatSessionById(token, sessionId);
        setActiveSession(data);
        setError("");
        return data;
      } catch (err) {
        setError(err.message || "Unable to load chat session.");
        throw err;
      } finally {
        setLoadingActiveSession(false);
      }
    },
    [token]
  );

  const startSession = async (payload = {}) => {
    setLoadingActiveSession(true);
    try {
      const data = await createChatSession(token, payload);
      setActiveSession(data);
      await refreshSessions().catch(() => {});
      return data;
    } catch (err) {
      setError(err.message || "Unable to create session.");
      throw err;
    } finally {
      setLoadingActiveSession(false);
    }
  };

  useEffect(() => {
    refreshSessions().catch(() => {});
  }, [refreshSessions]);

  return {
    sessions,
    activeSession,
    loadingSessions,
    loadingActiveSession,
    error,
    setActiveSession,
    refreshSessions,
    loadSession,
    startSession,
  };
};
