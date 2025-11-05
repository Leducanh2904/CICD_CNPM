/**
 * Unit tests for middleware/verifySeller.js
 */
const verifySeller = require("../../middleware/verifySeller");

const res = {};
const next = () => jest.fn();

describe("middleware/verifySeller", () => {
  test("passes when user has seller role (case-insensitive)", () => {
    const n = next();
    verifySeller({ user: { roles: "SeLLeR" } }, res, n);
    expect(n).toHaveBeenCalled();
  });

  test("throws when user missing", () => {
    const n = next();
    expect(() => verifySeller({}, res, n)).toThrow();
  });

  test("throws when role is not seller", () => {
    const n = next();
    expect(() => verifySeller({ user: { roles: "user" } }, res, n)).toThrow();
  });
});
