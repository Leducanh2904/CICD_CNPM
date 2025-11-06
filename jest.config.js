// jest.config.js (ở repo root)
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  // Chỉ match test trong unit & integration
  testMatch: [
    "**/__tests__/unit/**/*.test.js",
    "**/__tests__/integration/**/*.test.js",
  ],
  // Bỏ qua thư mục controllers
  testPathIgnorePatterns: [
    "<rootDir>/server/__tests__/controllers/",
    "/node_modules/",
  ],
  setupFiles: ["<rootDir>/server/jest/env.setup.js"],
  // Nếu bạn có các file này, giữ lại; nếu chưa có có thể bỏ 2 dòng dưới
  globalSetup: "<rootDir>/server/jest/globalSetup.js",
  globalTeardown: "<rootDir>/server/jest/globalTeardown.js",

  // Dùng bcryptjs trong môi trường test/CI
  moduleNameMapper: {
    "^bcrypt$": require.resolve("bcryptjs"),
  },

  clearMocks: true,
  moduleFileExtensions: ["js", "json"],
};
