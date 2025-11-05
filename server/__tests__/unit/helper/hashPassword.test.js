/**
 * Unit tests for helpers/hashPassword.js
 * - We mock bcrypt to avoid slow hashing.
 */
jest.mock("bcrypt", () => ({
  hashSync: jest.fn((plain, saltRounds) => `hashed(${plain})`),
  compareSync: jest.fn((plain, hashed) => hashed === `hashed(${plain})`),
}));

const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../../helpers/hashPassword");

describe("helpers/hashPassword", () => {
  test("hashPassword produces a different string", () => {
    const hashed = hashPassword("secret");
    expect(hashed).toBe("hashed(secret)");
    expect(bcrypt.hashSync).toHaveBeenCalled();
  });

  test("comparePassword validates correct password", () => {
    const hashed = "hashed(secret)";
    expect(comparePassword("secret", hashed)).toBe(true);
    expect(comparePassword("wrong", hashed)).toBe(false);
  });
});
