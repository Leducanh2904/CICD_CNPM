/**
 * PaymentService unit tests
 * - Await async functions
 * - Match updateOrderStatus(arg1, 'paid') signature (no third arg)
 */
jest.mock("../../../services/order.service", () => ({
  updateOrderStatus: jest.fn(),
}));

const orderService = require("../../../services/order.service");
const PaymentService = require("../../../services/payment.service");

describe("PaymentService.createIntent", () => {
  test("returns a QR url (shape only)", async () => {
    const result = await PaymentService.createIntent({ amount: 50000, orderRef: "ORD123" });
    expect(result).toHaveProperty("qrUrl");
    expect(typeof result.qrUrl).toBe("string");
  });
});

describe("PaymentService.verify", () => {
  test("marks order as paid", async () => {
    orderService.updateOrderStatus.mockResolvedValue({ id: "ORD123", status: "paid" });
    const payload = { orderRef: "ORD123", userId: 1 };
    const res = await PaymentService.verify(payload);

    expect(orderService.updateOrderStatus).toHaveBeenCalledTimes(1);
    const [arg1, arg2] = orderService.updateOrderStatus.mock.calls[0];
    expect(arg1).toEqual(expect.objectContaining({ orderRef: "ORD123", userId: 1 }));
    expect(arg2).toBe("paid");

    expect(res.status).toBe("paid");
  });
});
