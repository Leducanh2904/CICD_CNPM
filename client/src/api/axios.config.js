import axios from "axios";

// Determine base URL safely
let baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || ''
  : "http://localhost:10000/api";

if (typeof window !== 'undefined') {
  // If no VITE_API_URL, use same origin (useful when backend and frontend live together)
  if (!baseURL) {
    // fallback to same origin + /api (matches local dev base)
    baseURL = window.location.origin + '/api';
  }
  // If page is https but baseURL starts with http, switch to https
  if (window.location.protocol === 'https:' && baseURL.startsWith('http://')) {
    baseURL = baseURL.replace(/^http:\/\//i, 'https://');
  }

  // Normalize malformed values like ":10000/api" -> "http(s)://<host>:10000/api"
  if (/^:/.test(baseURL)) {
    baseURL = window.location.protocol + '//' + window.location.hostname + baseURL;
  }

  // If protocol-relative URL (//host/...), add current protocol
  if (/^\/\//.test(baseURL)) {
    baseURL = window.location.protocol + baseURL;
  }

  // Helpful debug output while developing
  // Remove or guard this in production if you don't want logs
  // (Vite will strip console in some production builds but it's fine during dev)
  // eslint-disable-next-line no-console
  console.debug('[API] baseURL resolved to', baseURL);
}

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
