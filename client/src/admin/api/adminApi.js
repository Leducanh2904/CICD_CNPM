// Dùng chung axios instance đã cấu hình động (baseURL = {origin}/api)
import API from "@/api/axios.config";

// Admin: gọi trực tiếp vào các path (KHÔNG thêm /api vì baseURL đã có /api)
export const getAdminStats = async (queryString = "") => {
  const res = await API.get(`/orders/admin/stats${queryString}`);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await API.get("/users");
  return res.data;
};

export const lockUser = async (id, reason) => {
  const res = await API.post(`/users/${id}/lock`, { reason });
  return res.data;
};

export const unlockUser = async (id, reason) => {
  const res = await API.post(`/users/${id}/unlock`, { reason });
  return res.data;
};

export const getStores = async () => {
  const res = await API.get("/stores");
  return res.data.data || res.data;
};

export const getSellersWithoutStore = async () => {
  const res = await API.get("/users/sellers/available");
  return res.data;
};

export default API;
