const validateUser = require("../../helpers/validateUser");

test("invalid when password < 6", () => {
  expect(validateUser("a@b.com", "123")).toBe(false);
});

test("valid email & password", () => {
  expect(validateUser("a@b.com", "123456")).toBe(true);
});
