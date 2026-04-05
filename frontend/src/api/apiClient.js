
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

export const buildAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const parseJson = async (response) => response?.data ?? {};

export const unwrapData = (payload, fallbackKeys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (payload.data !== undefined) {
    return payload.data;
  }

  for (const key of fallbackKeys) {
    if (payload[key] !== undefined) {
      return payload[key];
    }
  }

  return payload;
};

const createRequestError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Request failed";

  return new Error(message);
};

export const requestJson = async (path, { method = "GET", token, body, headers = {} } = {}) => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      headers: {
        ...buildAuthHeaders(token),
        ...headers,
      },
      ...(body !== undefined ? { data: body } : {}),
    });

    return await parseJson(response);
  } catch (error) {
    throw createRequestError(error);
  }
};

export const requestFormData = async (path, { method = "POST", token, formData } = {}) => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      data: formData,
    });

    return await parseJson(response);
  } catch (error) {
    throw createRequestError(error);
  }
};
