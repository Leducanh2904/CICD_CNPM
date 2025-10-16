import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Fix: Use plain "auth-token" header (no Bearer) to match backend verifyToken expect
    config.headers["auth-token"] = token;
    console.log("🔑 AdminAPI: Attached plain auth-token for", config.url);  // Debug: Confirm plain token
  } else {
    console.warn("⚠️ AdminAPI: No token in localStorage for", config.url);
  }
  return config;
});

// Giữ response interceptor để log error nếu cần
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ AdminAPI Error Details:", {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("❌ AdminAPI Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default adminApi;