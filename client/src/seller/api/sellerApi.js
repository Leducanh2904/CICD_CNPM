import axios from "axios";

// 🟢 Nếu đang chạy production (Render), dùng domain thật
// 🟡 Nếu đang dev (localhost), dùng port 10000 như cũ
export const API_ORIGIN = import.meta.env.PROD
  ? "https://cicd-cnpm-1.onrender.com"
  : "http://localhost:10000";

const sellerApi = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 15000,
});

sellerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["auth-token"] = token;
    console.log("🔑 SellerAPI: Attached plain auth-token for", config.url);
  } else {
    console.warn("⚠️ SellerAPI: No token in localStorage for", config.url);
  }
  return config;
});

sellerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ SellerAPI Error Details:", {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("❌ SellerAPI Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// 🟢 Sử dụng baseURL chuẩn để gọi API (đã có /api)
export const getSellerStats = async () => {
  try {
    const response = await sellerApi.get('/orders/seller/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    throw error;
  }
};

export default sellerApi;
