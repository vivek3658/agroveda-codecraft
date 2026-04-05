import { requestJson, unwrapData } from "../api/apiClient";

const normalizeCropList = (payload) => {
  const data = unwrapData(payload, ["crops", "items"]);
  const crops = Array.isArray(data)
    ? data
    : data?.crops || payload?.crops || payload?.items || [];

  return {
    crops: Array.isArray(crops) ? crops : [],
    totalPages: data?.totalPages || payload?.totalPages || 1,
    totalCrops:
      data?.totalCrops ||
      payload?.totalCrops ||
      data?.total ||
      payload?.total ||
      (Array.isArray(crops) ? crops.length : 0),
    page: data?.page || payload?.page || 1,
  };
};

export const getCrops = async (token, page = 1, limit = 10) => {
  const payload = await requestJson(`/crops/my/all?page=${page}&limit=${limit}`, { token });
  return normalizeCropList(payload);
};

export const getCropById = async (cropId, token) => {
  const payload = await requestJson(`/crops/${cropId}`, { token });
  return unwrapData(payload, ["crop"]);
};

export const createCrop = async (cropData, token) => {
  const payload = await requestJson("/crops", {
    method: "POST",
    token,
    body: cropData,
  });
  return unwrapData(payload, ["crop"]);
};

export const updateCrop = async (cropId, cropData, token) => {
  const payload = await requestJson(`/crops/${cropId}`, {
    method: "PUT",
    token,
    body: cropData,
  });
  return unwrapData(payload, ["crop"]);
};

export const deleteCrop = async (cropId, token) => {
  return await requestJson(`/crops/${cropId}`, {
    method: "DELETE",
    token,
  });
};
