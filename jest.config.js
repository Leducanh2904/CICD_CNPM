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
// jest.config.js (đặt ở repo root D:\CICD_CNPM\)
// jest.config.js (ở repo root)
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).js",
    "**/__tests__/**/*.(int|integration).test.js",
  ],
  setupFiles: ["<rootDir>/server/jest/env.setup.js"],
};

// jest.config.js (ở root)
module.exports = {
  testEnvironment: "node",
  // Nếu bạn đã có config cho unit, chỉ cần chắc testMatch bắt được *.int.test.js
  testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.int.test.js"],
  setupFiles: ["<rootDir>/server/jest/env.setup.js"],
  globalSetup: "<rootDir>/server/jest/globalSetup.js",
  globalTeardown: "<rootDir>/server/jest/globalTeardown.js",
};





