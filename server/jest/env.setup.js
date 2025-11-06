// server/test-setup/env.setup.js
process.env.NODE_ENV = "test";

// Đảm bảo không dùng DATABASE_URL khi test
delete process.env.DATABASE_URL;

// Set PG* mặc định cho test (trùng với .env bạn gửi)
process.env.PGHOST = process.env.PGHOST || "localhost";
process.env.PGPORT = process.env.PGPORT || "5432";
process.env.PGUSER = process.env.PGUSER || "postgres";
process.env.PGDATABASE = process.env.PGDATABASE || "pernstore";
process.env.PGPASSWORD = process.env.PGPASSWORD || "newpassword";

// JWT key cho test
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

console.log("[SETUP] test env loaded via setupFiles");
jest.mock('pino', () => {
  // trả về "logger" giả có đủ API hay dùng
  return () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() })),
  });
});
// Dùng bcryptjs thay cho bcrypt trong test để tránh lỗi ELF header
jest.mock('bcrypt', () => require('bcryptjs'));
