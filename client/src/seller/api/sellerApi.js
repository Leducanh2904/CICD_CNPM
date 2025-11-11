import axios from "axios";

function getBackendOrigin() {
  if (import.meta.env.PROD) {
    const env = import.meta.env.VITE_API_URL || '';
    if (env) return env.replace(/\/api\/?$/, '').replace(/\/$/, '');
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  }
  return 'http://localhost:10000';
}

const API_URL = getBackendOrigin();
// eslint-disable-next-line no-console
console.debug('[SellerAPI] baseURL resolved to', API_URL);

const sellerApi = axios.create({
  baseURL: API_URL,
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
        url: error.config.url,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("❌ SellerAPI Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const getSellerStats = async () => {
  try {
    const response = await sellerApi.get('/api/orders/seller/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    throw error;
  }
};

export default sellerApi;