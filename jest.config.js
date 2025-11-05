/**
 * Jest config for PERN project with server/ as code root.
 * - Roots: only look under <rootDir>/server for tests.
 * - Test files: any *.test.js inside __tests__ directories.
 */
module.exports = {
  roots: ["<rootDir>/server"],
  testMatch: ["**/__tests__/**/*.test.js"],
  testEnvironment: "node",
  clearMocks: true,
  moduleFileExtensions: ["js", "json"],
};
module.exports = {
  roots: ["<rootDir>/server"],
  testMatch: ["**/__tests__/integration/**/*.int.test.js"],
  testEnvironment: "node",
  globalSetup: "<rootDir>/server/__tests__/integration/setup/globalSetup.js",
  globalTeardown: "<rootDir>/server/__tests__/integration/setup/globalTeardown.js",

  // 👇 chạy TRƯỚC khi test import app.js
  setupFiles: ["<rootDir>/server/__tests__/integration/setup/env-bridge.js"],

  clearMocks: true,
  maxWorkers: 1,
};
// jest.config.js
module.exports = {
  // ...
  setupFiles: [
    "<rootDir>/server/__tests__/integration/setup/env.setup.js"
  ],
  // Nếu đã có setupFilesAfterEnv, giữ nguyên – cái này dùng 'setupFiles'
};






