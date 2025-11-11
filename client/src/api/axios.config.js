// client/src/api/axios.config.js
import axios from "axios";

const isProd = import.meta.env.PROD;

// Origin cho dev và ảnh
const devOrigin =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "http://localhost:10000";

// Base URL cho axios
const baseURL = isProd
  ? `${window.location.origin}/api`   // Render: same-origin → không mixed-content
  : `${devOrigin}/api`;               // Local dev

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers["auth-token"] = token;
    return req;
  },
  (error) => Promise.reject(error)
);

export default API;

// Nếu nơi khác cần origin để load ảnh (ví dụ /images/xxx):
export const API_ORIGIN = isProd ? window.location.origin : devOrigin;
