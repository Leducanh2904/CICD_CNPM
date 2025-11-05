/**
 * Unit tests for services/payment.service.js
 * - orderService is mocked to verify side-effects.
 */
jest.mock("../../services/order.service", () => ({
  updateOrderStatus: jest.fn(),
}));
const orderService = require("../../services/order.service");
const PaymentService = require("../../services/payment.service");

describe("PaymentService.createIntent", () => {
  test("returns a QR url (shape only)", () => {
    const result = PaymentService.createIntent({ amount: 50000, orderRef: "ORD123" });
    expect(result).toHaveProperty("qrUrl");
    expect(typeof result.qrUrl).toBe("string");
  });
});

describe("PaymentService.verify", () => {
  test("marks order as paid", async () => {
    orderService.updateOrderStatus.mockResolvedValue({ id: "ORD123", status: "paid" });
    const res = await PaymentService.verify({ orderRef: "ORD123", userId: 1 });
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith("ORD123", "paid", 1);
    expect(res.status).toBe("paid");
  });
});
