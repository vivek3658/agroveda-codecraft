import { useCallback, useEffect, useState } from "react";
import {
  getSoilChatSessions,
  getSoilPredictions,
} from "../../../services/soilChatbot.service";

export const usePredictionHistory = (token) => {
  const [predictions, setPredictions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState("");

  const refreshPredictions = useCallback(async () => {
    if (!token) {
      setPredictions([]);
      setLoadingPredictions(false);
      return [];
    }

    setLoadingPredictions(true);
    try {
      const nextPredictions = await getSoilPredictions(token);
      setPredictions(nextPredictions);
      setError("");
      return nextPredictions;
    } catch (err) {
      setError(err.message || "Unable to load prediction history.");
      throw err;
    } finally {
      setLoadingPredictions(false);
    }
  }, [token]);

  const refreshSessions = useCallback(async () => {
    if (!token) {
      setSessions([]);
      setLoadingSessions(false);
      return [];
    }

    setLoadingSessions(true);
    try {
      const nextSessions = await getSoilChatSessions(token);
      setSessions(nextSessions);
      setError("");
      return nextSessions;
    } catch (err) {
      setError(err.message || "Unable to load chat sessions.");
      throw err;
    } finally {
      setLoadingSessions(false);
    }
  }, [token]);

  useEffect(() => {
    refreshPredictions().catch(() => {});
    refreshSessions().catch(() => {});
  }, [refreshPredictions, refreshSessions]);

  return {
    predictions,
    sessions,
    loadingPredictions,
    loadingSessions,
    error,
    refreshPredictions,
    refreshSessions,
  };
};
