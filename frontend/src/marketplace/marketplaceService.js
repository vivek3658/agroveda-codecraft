import { requestJson, unwrapData } from "../api/apiClient";

export const getMarketplaceListings = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const payload = await requestJson(`/marketplace${query ? `?${query}` : ""}`);
  const data = unwrapData(payload, ["listings", "items"]);
  const listings = Array.isArray(data)
    ? data
    : data?.listings || payload?.listings || payload?.items || [];

  return {
    listings: Array.isArray(listings) ? listings : [],
    totalPages: data?.totalPages || payload?.totalPages || 1,
    total: data?.total || payload?.total || listings.length,
  };
};

export const createOrder = async (orderData, token) => {
  return await requestJson("/orders", {
    method: "POST",
    token,
    body: orderData,
  });
};

export const getMyOrders = async (token) => {
  const payload = await requestJson("/orders/my-orders", { token });
  const data = unwrapData(payload, ["orders", "items"]);
  const orders = Array.isArray(data) ? data : data?.orders || payload?.orders || payload?.items || [];

  return Array.isArray(orders) ? orders : [];
};
