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






