/**
 * helpers/hashPassword tests (patched)
 * - Mock async bcrypt-like API: genSalt, hash, compare
 * - Use await
 */
jest.mock("bcrypt", () => ({
  genSalt: jest.fn(async () => "salt"),
  hash: jest.fn(async (plain, salt) => `hashed(${plain})`),
  compare: jest.fn(async (plain, hashed) => hashed === `hashed(${plain})`),
}));

const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../../../helpers/hashPassword");

describe("helpers/hashPassword (async)", () => {
  test("hashPassword produces a different string", async () => {
    const hashed = await hashPassword("secret");
    expect(hashed).toBe("hashed(secret)");
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  test("comparePassword validates correct password", async () => {
    const ok = await comparePassword("secret", "hashed(secret)");
    const bad = await comparePassword("wrong", "hashed(secret)");
    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });
});
