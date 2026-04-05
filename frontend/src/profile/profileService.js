import { requestJson, unwrapData } from "../api/apiClient";

export const getMyProfile = async (token) => {
  const payload = await requestJson("/profile/me", { token });
  return unwrapData(payload, ["profile"]);
};

export const updateMyProfile = async (profileData, token) => {
  const payload = await requestJson("/profile/me", {
    method: "PUT",
    token,
    body: profileData,
  });
  return unwrapData(payload, ["profile"]);
};
