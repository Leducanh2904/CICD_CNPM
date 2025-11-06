const pino = require("pino");

// Create a logging instance
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  prettyPrint: process.env.NODE_ENV !== "production",
});

module.exports.logger = logger;
const isProd = process.env.NODE_ENV === 'production';
let transport;

// Chỉ dùng pino-pretty khi KHÔNG phải production và có thể không cài cũng không sao
if (!isProd && process.env.PRETTY_LOGS !== 'false') {
  try {
    transport = pino.transport({
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' }
    });
  } catch (_) {
    // không cài pino-pretty thì vẫn chạy với logger thường
    transport = undefined;
  }
}

module.exports = { logger };
