/**
 * Unit tests for middleware/verifyAdmin.js
 */
const verifyAdmin = require("../../middleware/verifyAdmin");

const withReq = (user) => ({ user });
const res = {};
const next = () => jest.fn();

describe("middleware/verifyAdmin", () => {
  test("passes when user has admin role", () => {
    const n = next();
    verifyAdmin(withReq({ roles: "admin" }), res, n);
    expect(n).toHaveBeenCalled();
  });

  test("throws when user is missing or not admin", () => {
    const n = next();
    expect(() => verifyAdmin(withReq({ roles: "user" }), res, n)).toThrow();
    expect(n).not.toHaveBeenCalled();
  });
});
