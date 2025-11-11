// server/app.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const unknownEndpoint = require("./middleware/unKnownEndpoint");

const app = express();

// CORS cho local dev
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
  "https://cicd-cnpm-1.onrender.com", // thêm domain Render
];

app.use(cors({
  origin: isProd ? true : function(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.options("*", cors());


app.use(express.json());

// Health
app.get("/api/health", (_req, res) => res.status(200).send("ok"));
app.head("/api/health", (_req, res) => res.sendStatus(200));

// API
app.use("/api", routes);

// Ảnh upload
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ==== SERVE FRONTEND BUILD ====
const clientDist = path.join(__dirname, "public");

// Serve thư mục assets với cache dài
app.use("/assets", express.static(path.join(clientDist, "assets"), {
  immutable: true,
  maxAge: "1y",
}));

// Serve các file tĩnh còn lại (index.html, icons…)
app.use(express.static(clientDist));

// Fallback chỉ cho request “HTML” và KHÔNG có đuôi file
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  if (path.extname(req.path)) return next(); // có .js, .css, .png… thì không fallback
  res.sendFile(path.join(clientDist, "index.html"));
});

// 404 cho /api
app.use(unknownEndpoint);

module.exports = app;
