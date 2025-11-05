
const validateUser = require("../../../helpers/validateUser");

describe("helpers/validateUser", () => {
  test("returns false when email is empty", () => {
    expect(validateUser("", "123456")).toBe(false);
  });

  test("returns false when password length < 6", () => {
    expect(validateUser("a@b.com", "123")).toBe(false);
  });

  test("returns true for valid email & password", () => {
    expect(validateUser("a@b.com", "123456")).toBe(true);
  });
});
