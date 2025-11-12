import axios from "axios";
import { normalizeToken } from "helpers/token";
// const baseURL = import.meta.env.PROD
//   ? import.meta.env.VITE_API_URL
//   : "http://localhost:10000/api";
const RAW = import.meta.env.VITE_API_URL || "http://localhost:10000";
const baseURL = `${RAW.replace(/\/+$/, "")}/api`;
const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  function (req) {
    const token = normalizeToken(localStorage.getItem("token"));
    if (token) {
      req.headers["auth-token"] = token;
      // console.log("🔑 Attached token:", token);
    } else {
      // console.warn("⚠️ No token found in localStorage");
    }
    return req;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default API;
