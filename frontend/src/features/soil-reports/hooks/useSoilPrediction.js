import { useState } from "react";
import {
  predictSoilFromManualData,
  uploadSoilReportFile,
} from "../../../services/soilChatbot.service";

export const useSoilPrediction = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runManualPrediction = async (values) => {
    setLoading(true);
    setError("");
    try {
      const result = await predictSoilFromManualData(token, values);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err.message || "Failed to generate prediction.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runFilePrediction = async (file) => {
    setLoading(true);
    setError("");
    try {
      const result = await uploadSoilReportFile(token, file);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err.message || "Failed to upload soil report.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    runManualPrediction,
    runFilePrediction,
  };
};
