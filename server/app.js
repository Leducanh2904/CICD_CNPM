// server/app.js
const express = require("express");
const path = require("path");
const routes = require("./routes");
const unknownEndpoint = require("./middleware/unKnownEndpoint");

const app = express();
app.use(express.json());

// Health check cho Render
app.get("/api/health", (_req, res) => res.status(200).send("ok"));
app.head("/api/health", (_req, res) => res.sendStatus(200));

// API mount dưới /api
app.use("/api", routes);

// (nếu có ảnh upload) phục vụ thư mục ảnh tĩnh
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ---- Serve frontend build (Vite/React) ----
const clientDist = path.resolve(__dirname, "public");

// Phục vụ static assets (JS/CSS/img)
app.use(express.static(clientDist));

// Fallback tất cả route còn lại về index.html (cho SPA router)
app.get("*", (req, res, next) => {
  // Nếu vô tình lọt yêu cầu /api/* tới đây (do không khớp route),
  // để unknownEndpoint xử lý.
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

// Unknown endpoint cho /api/*
app.use(unknownEndpoint);

module.exports = app;
