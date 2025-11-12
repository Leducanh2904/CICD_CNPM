import axios from "axios";
import { normalizeToken } from "helpers/token";

const RAW = import.meta.env.VITE_API_URL || "http://localhost:10000";
const BASE = `${RAW.replace(/\/+$/, "")}/api`;

const sellerApi = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

sellerApi.interceptors.request.use((config) => {
  const token = normalizeToken(localStorage.getItem("token"));
  if (token) config.headers["auth-token"] = token;
  return config;
});

sellerApi.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export const getSellerStats = async () =>
  (await sellerApi.get(`/orders/seller/stats`)).data;

export default sellerApi;
