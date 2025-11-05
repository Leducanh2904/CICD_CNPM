/**
 * Unit tests for services/user.service.js
 */
jest.mock("../../db/user.db", () => ({
  findByEmailDb: jest.fn(),
  findByUsernameDb: jest.fn(),
  createUserDb: jest.fn(),
  updateUserDb: jest.fn(),
  changeUserPasswordDb: jest.fn(),
  getUsersByRoleDb: jest.fn(),
}));

const db = require("../../db/user.db");
const UserService = require("../../services/user.service");

describe("UserService.createUser", () => {
  test("throws when email already exists", async () => {
    db.findByEmailDb.mockResolvedValue({ id: 1 });
    await expect(UserService.createUser({ email: "a@b.com", username: "x" })).rejects.toThrow();
  });

  test("creates when unique", async () => {
    db.findByEmailDb.mockResolvedValue(null);
    db.findByUsernameDb.mockResolvedValue(null);
    db.createUserDb.mockResolvedValue({ id: 2 });
    const res = await UserService.createUser({ email: "a@b.com", username: "x" });
    expect(res).toEqual({ id: 2 });
  });
});

describe("UserService.updateUser", () => {
  test("passes through to DB", async () => {
    db.updateUserDb.mockResolvedValue({ id: 3, name: "New" });
    const res = await UserService.updateUser(3, { name: "New" });
    expect(db.updateUserDb).toHaveBeenCalledWith(3, { name: "New" });
    expect(res.name).toBe("New");
  });
});
