// server/test-setup/env.setup.js
process.env.NODE_ENV = "test";

// Dọn DB URL để không build connection string thật
delete process.env.DATABASE_URL;

// Set PG* “ảo” cho test (nếu code có đọc env vẫn không lỗi)
process.env.PGHOST = process.env.PGHOST || "localhost";
process.env.PGPORT = process.env.PGPORT || "5432";
process.env.PGUSER = process.env.PGUSER || "postgres";
process.env.PGDATABASE = process.env.PGDATABASE || "pernstore";
process.env.PGPASSWORD = process.env.PGPASSWORD || "newpassword";

// JWT key cho test
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

console.log("[SETUP] test env loaded via setupFiles");

// ✅ Mock logger để im lặng trong test
jest.mock("pino", () => {
  return () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  });
});

// ✅ Mock toàn cục 'pg' để KHÔNG kết nối DB thật trong CI
jest.mock("pg", () => {
  const mockClient = {
    query: jest.fn(async () => ({ rows: [] })), // mặc định trả mảng rỗng
    connect: jest.fn(),
    end: jest.fn(),
  };
  // Pool sẽ trả về mockClient
  return { Pool: jest.fn(() => mockClient) };
});

/**
 * Ghi chú:
 * - Không mock 'bcrypt' ở đây để tránh vòng lặp require.
 * - Nếu muốn dùng bcryptjs, hãy thêm vào jest.config.js:
 *     moduleNameMapper: { '^bcrypt$': require.resolve('bcryptjs') }
 *   (không bắt buộc nếu bạn đã ổn định với bcrypt ở môi trường test)
 */
