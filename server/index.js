require('./otel');
require("dotenv").config({ path: __dirname + "/.env" });
const http = require("http");
const app = require("./app");
const { logger } = require("./utils/logger");

const server = http.createServer(app);

// BẮT BUỘC: phải lấy PORT từ môi trường Render cấp
const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});