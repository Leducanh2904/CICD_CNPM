import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
