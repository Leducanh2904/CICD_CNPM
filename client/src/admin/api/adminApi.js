import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["auth-token"] = token;
    console.log("🔑 AdminAPI: Attached plain auth-token for", config.url);
  } else {
    console.warn("⚠️ AdminAPI: No token in localStorage for", config.url);
  }
  return config;
});

// Response interceptor
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

export const getAdminStats = async (queryString = '') => {
  try {
    const response = await adminApi.get(`/api/orders/admin/stats${queryString}`);  // ✅ FIX: /api/orders số nhiều
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await adminApi.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const lockUser = async (id, reason) => {
  try {
    const response = await adminApi.post(`/api/users/${id}/lock`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error locking user:', error);
    throw error;
  }
};

export const unlockUser = async (id, reason) => {
  try {
    const response = await adminApi.post(`/api/users/${id}/unlock`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error unlocking user:', error);
    throw error;
  }
};

export const getStores = async () => {
  try {
    const response = await adminApi.get('/api/stores');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

export const getSellersWithoutStore = async () => {
  try {
    console.log("🔍 Calling /api/users/sellers/available");
    const response = await adminApi.get('/api/users/sellers/available');
    console.log("✅ Response for sellers without store:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers without store:', error);
    if (error.response) {
      console.error('Full response error:', error.response.data);
    }
    throw error;
  }
};

export default adminApi;