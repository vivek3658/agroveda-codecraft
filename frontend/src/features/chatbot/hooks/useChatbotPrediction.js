import { useState } from "react";
import { predictFromManualInput, uploadSoilFile } from "../../../services/chatbot.service";

export const useChatbotPrediction = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runManualPrediction = async (values) => {
    setLoading(true);
    setError("");
    try {
      const result = await predictFromManualInput(token, values);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.message || "Prediction failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runFileUpload = async (file) => {
    setLoading(true);
    setError("");
    try {
      const result = await uploadSoilFile(token, file);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.message || "Upload failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    runManualPrediction,
    runFileUpload,
  };
};
