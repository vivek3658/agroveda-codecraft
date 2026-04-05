export const getFarmingCourses = async () => {
  const response = await fetch("/resources/farming-courses.json");

  if (!response.ok) {
    throw new Error("Failed to load farming courses.");
  }

  return await response.json();
};
