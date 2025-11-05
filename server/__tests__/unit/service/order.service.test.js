/**
 * Unit tests for services/order.service.js
 */
jest.mock("../../db/orders.db", () => ({
  createOrderDb: jest.fn(),
  getOrderDb: jest.fn(),
  getAllOrdersDb: jest.fn(),
  updateOrderStatusDb: jest.fn(),
  getTotalOrdersDb: jest.fn(),
  getRevenueStatsDb: jest.fn(),
  getStoreRevenueStatsDb: jest.fn(),
  getOrderBySellerDb: jest.fn(),
}));

const db = require("../../db/orders.db");
const OrderService = require("../../services/order.service");

describe("OrderService.createOrder", () => {
  test("passes normalized data to createOrderDb", async () => {
    db.createOrderDb.mockResolvedValue({ id: 99 });
    const payload = { user_id: 1, items: [{ product_id: 2, quantity: 1 }], amount: 10000 };
    const res = await OrderService.createOrder(payload);
    expect(db.createOrderDb).toHaveBeenCalled();
    expect(res).toEqual({ id: 99 });
  });
});

describe("OrderService.updateOrderStatus", () => {
  test("rejects invalid status", async () => {
    await expect(OrderService.updateOrderStatus(1, "not_a_status", 1)).rejects.toThrow();
  });

  test("calls DB when status is valid", async () => {
    db.updateOrderStatusDb.mockResolvedValue({ id: 1, status: "paid" });
    const res = await OrderService.updateOrderStatus(1, "paid", 1);
    expect(db.updateOrderStatusDb).toHaveBeenCalled();
    expect(res.status).toBe("paid");
  });
});
