// server/app.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const unknownEndpoint = require("./middleware/unKnownEndpoint");

const app = express(); // 🟢 KHỞI TẠO app TRƯỚC

// --- CORS ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin(origin, cb) {
    // Cho phép request không có Origin (curl, healthcheck)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.options("*", cors()); // preflight

app.use(express.json());
app.use(express.json());

// 🟢 Health check (Render sẽ gọi để kiểm tra container)
app.get("/api/health", (_req, res) => res.status(200).send("ok"));
app.head("/api/health", (_req, res) => res.sendStatus(200));

// 🟢 Mount API routes
app.use("/api", routes);

// 🟢 Phục vụ ảnh tĩnh (upload)
app.use("/images", express.static(path.join(__dirname, "public/images")));

// 🟢 Khi chạy production: serve React build (dist)
const clientDist = path.resolve(__dirname, "public");
app.use(express.static(clientDist));

// 🟢 Tất cả route còn lại (ngoài /api) sẽ load index.html (cho React Router)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

// 🟢 Middleware xử lý endpoint không tồn tại (404)
app.use(unknownEndpoint);

module.exports = app;
