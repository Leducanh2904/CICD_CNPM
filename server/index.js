// server/index.js
require("dotenv").config({ path: __dirname + "/.env" });
const http = require("http");
const app = require("./app");
const { logger } = require("./utils/logger");

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Chỉ listen khi chạy thật (node server/index.js). Khi jest require file này thì KHÔNG listen.
if (require.main === module && process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = server; // nếu cần import trong e2e khác
