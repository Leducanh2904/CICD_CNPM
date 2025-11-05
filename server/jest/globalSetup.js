const fs = require("fs");
const path = require("path");
const { startDbAndSeed } = require("./test-db");
require("dotenv").config({ path: ".env" });

module.exports = async () => {
  const { connectionString } = await startDbAndSeed();

  // ENV chung
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  process.env.DATABASE_URL = connectionString;

  // Parse ra các thành phần
  const u = new URL(connectionString);
  const host = u.hostname;
  const port = String(u.port || 5432);
  const user = decodeURIComponent(u.username);
  const pass = decodeURIComponent(u.password);
  const db   = u.pathname.replace(/^\//, "");

  // PG_* (nhiều lib pg đọc bộ này)
  Object.assign(process.env, {
    PGHOST: host,
    PGPORT: port,
    PGUSER: user,
    PGPASSWORD: pass,
    PGDATABASE: db,
  });

  // DB_* (nhiều code “tự ráp” URL từ bộ này)
  Object.assign(process.env, {
    DB_HOST: host,
    DB_PORT: port,
    DB_USER: user,
    DB_PASSWORD: pass,
    DB_NAME: db,
  });

  // DATABASE_* (phòng khi dự án dùng prefix này)
  Object.assign(process.env, {
    DATABASE_HOST: host,
    DATABASE_PORT: port,
    DATABASE_USER: user,
    DATABASE_PASSWORD: pass,
    DATABASE_NAME: db,
  });

  // Ghi file cầu nối để setup phía test đọc lại (đảm bảo trước khi require app)
  const bridgePath = path.join(__dirname, ".it-env.json");
  fs.writeFileSync(
    bridgePath,
    JSON.stringify({
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: connectionString,
      PGHOST: host, PGPORT: port, PGUSER: user, PGPASSWORD: pass, PGDATABASE: db,
      DB_HOST: host, DB_PORT: port, DB_USER: user, DB_PASSWORD: pass, DB_NAME: db,
      DATABASE_HOST: host, DATABASE_PORT: port, DATABASE_USER: user, DATABASE_PASSWORD: pass, DATABASE_NAME: db,
    }, null, 2),
    "utf8"
  );
};
