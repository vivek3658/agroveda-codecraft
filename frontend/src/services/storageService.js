export const getStorageLocations = async () => {
  const response = await fetch("/resources/storage-locations.json");

  if (!response.ok) {
    throw new Error("Failed to load storage locations.");
  }

  return await response.json();
};
