// Tạo base URL chuẩn, tự thêm /api ở cuối
const RAW = import.meta.env.VITE_API_URL || "http://localhost:10000";
const BASE = `${RAW.replace(/\/+$/, "")}/api`;

export const getStores = async () => {
  const res = await fetch(`${BASE}/stores`, {
    credentials: "include", // nếu backend có dùng cookie hoặc session
  });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};
