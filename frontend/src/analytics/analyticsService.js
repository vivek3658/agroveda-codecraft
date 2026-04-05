import { requestJson, unwrapData } from "../api/apiClient";

export const getFarmerAnalyticsOverview = async (token) => {
  const payload = await requestJson("/analytics/farmer/overview", { token });
  return unwrapData(payload, ["overview"]);
};
