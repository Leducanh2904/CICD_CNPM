import axios from "axios";

const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : "http://localhost:9000/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  function (req) {
    const token = localStorage.getItem("token"); // chuỗi JWT
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
