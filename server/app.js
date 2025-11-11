const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const unknownEndpoint = require("./middleware/unKnownEndpoint");

const app = express();

const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:3000",
  ...envOrigins,
]);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);             // healthcheck/curl
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.options("*", cors());

app.use(express.json());

// health
app.get("/api/health", (_req, res) => res.status(200).send("ok"));
app.head("/api/health", (_req, res) => res.sendStatus(200));

// API
app.use("/api", routes);

// static uploads (nếu có)
app.use("/images", express.static(path.join(__dirname, "public/images")));

// serve client build
const clientDist = path.resolve(__dirname, "public");
app.use(express.static(clientDist));

// SPA fallback (trừ /api)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(unknownEndpoint);

module.exports = app;
