const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export const getStores = async () => {
  const res = await fetch(`${API_URL}/api/stores`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};