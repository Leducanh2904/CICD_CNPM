// server/utils/logger.js
const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

let transport;
if (!isProd) {
  try {
    // chỉ bật pretty ở dev nếu module có sẵn
    transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    };
  } catch (e) {
    // không có pino-pretty thì thôi, vẫn log bình thườngaaaaaaaa
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});

module.exports = { logger };
