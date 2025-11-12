import axios from "axios";
import { normalizeToken } from "helpers/token";

const RAW = import.meta.env.VITE_API_URL || "http://localhost:10000";
const BASE = `${RAW.replace(/\/+$/, "")}/api`;

const adminApi = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  const token = normalizeToken(localStorage.getItem("token"));
  if (token) config.headers["auth-token"] = token;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

// Giữ nguyên đường dẫn có /api ở đầu
export const getAdminStats = async (queryString = "") =>
  (await adminApi.get(`/orders/admin/stats${queryString}`)).data;

export const getAllUsers = async () =>
  (await adminApi.get(`/users`)).data;

export const lockUser = async (id, reason) =>
  (await adminApi.post(`/users/${id}/lock`, { reason })).data;

export const unlockUser = async (id, reason) =>
  (await adminApi.post(`/users/${id}/unlock`, { reason })).data;

export const getStores = async () =>
  (await adminApi.get(`/stores`)).data;

export const getSellersWithoutStore = async () =>
  (await adminApi.get(`/users/sellers/available`)).data;

export default adminApi;
