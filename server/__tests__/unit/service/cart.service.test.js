jest.mock("../../db/cart.db", () => ({
  addItemDb: jest.fn(), deleteItemDb: jest.fn(),
  increaseItemQuantityDb: jest.fn(), decreaseItemQuantityDb: jest.fn(),
  emptyCartDb: jest.fn(), getCartDb: jest.fn(), getCartCountDb: jest.fn()
}));
const CartService = require("../../services/cart.service");
const db = require("../../db/cart.db");

describe("CartService.addItem", () => {
  test("missing user_id → 400", async () => {
    await expect(CartService.addItem({ product_id: 1 }))
      .rejects.toThrow();
  });

  test("ok → gọi addItemDb đúng tham số", async () => {
    db.addItemDb.mockResolvedValue({ ok: true });
    await CartService.addItem({ user_id: 1, product_id: 2, quantity: 3 });
    expect(db.addItemDb).toHaveBeenCalledWith({ user_id: 1, product_id: 2, quantity: 3 });
  });
});
