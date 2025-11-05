/**
 * Unit tests for services/cart.service.js
 * - DB layer is mocked so we only test business logic.
 */
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.mock("../../../db/cart.db", () => ({
  addItemDb: jest.fn(),
  deleteItemDb: jest.fn(),
  increaseItemQuantityDb: jest.fn(),
  decreaseItemQuantityDb: jest.fn(),
  emptyCartDb: jest.fn(),
  getCartDb: jest.fn(),
  getCartCountDb: jest.fn(),
}));
const db = require("../../../db/cart.db");
const CartService = require("../../../services/cart.service");

describe("CartService.addItem", () => {
  test("throws when user_id missing", async () => {
    await expect(CartService.addItem({ product_id: 1 })).rejects.toThrow();
  });

  test("calls addItemDb with correct params", async () => {
    db.addItemDb.mockResolvedValue({ ok: true });
    await CartService.addItem({ user_id: 1, product_id: 2, quantity: 3 });
    expect(db.addItemDb).toHaveBeenCalledWith({ user_id: 1, product_id: 2, quantity: 3 });
  });
});

describe("CartService.getCartCount", () => {
  test("returns total items from DB", async () => {
    db.getCartCountDb.mockResolvedValue(5);
    const c = await CartService.getCartCount(1);
    expect(c).toBe(5);
  });
});
