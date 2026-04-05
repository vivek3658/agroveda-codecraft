const ADMIN_SESSION_KEY = "agroveda-admin-session";
const SPONSORED_PRODUCTS_KEY = "agroveda-sponsored-products";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Admin@123",
};

const ADMIN_USERNAME_ALIASES = ["admin", "agroveda-admin", "admin@agroveda"];

const defaultSponsoredProducts = [
  {
    id: "sp-1",
    brand: "GreenRoot",
    productName: "NitroBoost Fertilizer",
    category: "Fertilizer",
    cropTags: ["Wheat", "Rice", "Tomato"],
    description:
      "Nitrogen-rich fertilizer blend designed to improve early crop growth and leaf health.",
    suggestionText:
      "Useful for early-stage crop strengthening where fast green growth is needed.",
    buyUrl: "https://example.com/nitroboost",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sp-2",
    brand: "FarmShield",
    productName: "Crop Guard Bio Spray",
    category: "Crop Protection",
    cropTags: ["Chilli", "Cotton", "Tomato"],
    description:
      "Bio-based spray for routine preventive crop care and disease pressure reduction.",
    suggestionText:
      "Can be included in regular field protection planning for sensitive vegetable crops.",
    buyUrl: "https://example.com/cropguard",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loginAdmin = (username, password) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const valid =
    ADMIN_USERNAME_ALIASES.includes(normalizedUsername) &&
    normalizedPassword === ADMIN_CREDENTIALS.password;

  if (!valid) {
    throw new Error("Invalid admin credentials");
  }

  const session = {
    username: ADMIN_CREDENTIALS.username,
    role: "admin",
    loggedInAt: new Date().toISOString(),
  };

  safeWrite(ADMIN_SESSION_KEY, session);
  return session;
};

export const getAdminSession = () => safeRead(ADMIN_SESSION_KEY, null);

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const getSponsoredProducts = () => {
  const data = safeRead(SPONSORED_PRODUCTS_KEY, null);
  if (!data) {
    safeWrite(SPONSORED_PRODUCTS_KEY, defaultSponsoredProducts);
    return defaultSponsoredProducts;
  }
  return Array.isArray(data) ? data : defaultSponsoredProducts;
};

export const addSponsoredProduct = (product) => {
  const current = getSponsoredProducts();
  const next = [
    {
      ...product,
      id: `sp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
    },
    ...current,
  ];
  safeWrite(SPONSORED_PRODUCTS_KEY, next);
  return next;
};

export const removeSponsoredProduct = (id) => {
  const next = getSponsoredProducts().filter((item) => item.id !== id);
  safeWrite(SPONSORED_PRODUCTS_KEY, next);
  return next;
};

export const toggleSponsoredProduct = (id) => {
  const next = getSponsoredProducts().map((item) =>
    item.id === id ? { ...item, active: !item.active } : item
  );
  safeWrite(SPONSORED_PRODUCTS_KEY, next);
  return next;
};

export const getFarmerSponsoredSuggestions = () =>
  getSponsoredProducts().filter((item) => item.active);
