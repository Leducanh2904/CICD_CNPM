const express = require("express");
require("express-async-errors");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const helmet = require("helmet");
const compression = require("compression");
const unknownEndpoint = require("./middleware/unKnownEndpoint");
const { handleError } = require("./helpers/error");
const app = express();
const path = require("path");
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.set("trust proxy", 1);
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());  // ✅ Giữ nguyên ở đây để parse body cho tất cả routes (JSON/auth)
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(cookieParser());

// ✅ Xóa hoàn toàn app.use(upload.any()); - không cần global, multer per-route (trong product.js) sẽ handle multipart riêng mà không conflict với json()

app.use("/api", routes);  // ✅ Routes sau json(), multer.single() chỉ parse nếu Content-Type multipart (skip json cho file uploads)

app.get("/", (req, res) =>
  res.send("<h1 style='text-align: center'>E-COMMERCE API</h1>")
);
app.use(unknownEndpoint);
app.use(handleError);

module.exports = app;
// server/app.js
if (process.env.NODE_ENV === 'test') {
  console.log('[BOOT] NODE_ENV = test');
  console.log('[BOOT] PG env:', {
    PGHOST: process.env.PGHOST,
    PGPORT: process.env.PGPORT,
    PGUSER: process.env.PGUSER,
    PGDATABASE: process.env.PGDATABASE,
    hasDATABASE_URL: !!process.env.DATABASE_URL
  });
}

// Luôn ưu tiên bộ PG* trong test, tránh DATABASE_URL rác
if (process.env.NODE_ENV === 'test') {
  delete process.env.DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
}
