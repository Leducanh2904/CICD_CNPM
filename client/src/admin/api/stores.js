// Nếu muốn giữ fetch, dùng API_ORIGIN để build URL đúng môi trường
import { API_ORIGIN } from "@/api/axios.config";

export const getStores = async () => {
  const res = await fetch(`${API_ORIGIN}/api/stores`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};

// Hoặc, nếu muốn đồng bộ với axios + interceptors, dùng:
// import API from "@/api/axios.config";
// export const getStores = async () => {
//   const res = await API.get("/stores");
//   return res.data.data || res.data;
// };
