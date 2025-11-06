require("dotenv").config({ path: __dirname + "/.env" });
const http = require("http");
const app = require("./app");
const { logger } = require("./utils/logger");
const multer = require('multer'); 

const upload = multer({ dest: 'uploads/' });

app.use(upload.any());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => logger.info(`Magic happening on port: ${PORT}`));
// server/config/index.js
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'newpassword',
      database: process.env.PGDATABASE || 'pernstore',
    });

module.exports = pool;