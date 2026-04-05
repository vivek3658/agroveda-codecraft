import Cookies from "js-cookie";
import { apiClient } from "../api/apiClient";

/**
 * SIMPLE AUTH SERVICE - Frontend Only Sends Data
 * All validation and logic is handled by backend
 */

const normalizeAuthData = (data = {}, fallback = {}) => {
  const token =
    data.token ||
    data.accessToken ||
    data.jwt ||
    data.user?.token ||
    fallback.token ||
    null;

  const role =
    data.role ||
    data.user?.role ||
    data.userType ||
    data.accountType ||
    fallback.role ||
    null;

  const email =
    data.email ||
    data.user?.email ||
    data.user?.googleEmail ||
    fallback.email ||
    null;

  return {
    ...data,
    token,
    role,
    email,
  };
};

const persistAuthCookies = ({ token, role, email }) => {
  if (token) {
    Cookies.set("token", token, { sameSite: "Strict" });
  }

  if (role) {
    Cookies.set("role", role, { sameSite: "Strict" });
  }

  if (email) {
    Cookies.set("email", email, { sameSite: "Strict" });
  }
};

export const loginUser = async (email, password, role, captcha) => {
  let data;
  try {
    const response = await apiClient.post("/auth/login", { email, password, role, captcha });
    data = response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Login failed");
  }

  const normalizedData = normalizeAuthData(data, { email, role });

  persistAuthCookies(normalizedData);

  return normalizedData;
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/auth/register", {
      ...userData,
      reEnterPassword: userData.confirmPassword,
      captcha: userData.captchaInput,
    });

    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Registration failed");
  }
};

export const handleGoogleAuthResponse = async (token, role) => {
  console.log("Google Auth - Sending token:", token?.substring(0, 50) + "...");

  try {
    const response = await apiClient.post("/auth/google", {
        idToken: token,
        role,
    });
    const data = response.data;
    const normalizedData = normalizeAuthData(data, { role });
    console.log("Google auth response:", normalizedData);

    persistAuthCookies(normalizedData);

    return normalizedData;
  } catch (err) {
    console.error("Google Auth Error:", err);
    throw new Error(err?.response?.data?.message || err?.message || "Google authentication failed");
  }
};

export const clearAuthCookies = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("email");
};

export const getTokenFromCookies = () => {
  return Cookies.get("token") || null;
};
