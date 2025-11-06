// server/__tests__/integration/order.int.test.js
jest.setTimeout(15000);

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env.test") });

// ✅ Bỏ qua xác thực: inject sẵn req.user để tránh 401
jest.mock("../../middleware/verifyToken", () => {
  return (req, _res, next) => {
    req.user = { id: 1, email: "buyer@example.com" };
    next();
  };
});

// ✅ Mock ĐÚNG TÊN handler mà routes/order.js require từ controllers/orders.controller.js
// Thường routes gọi: createOrder, getOrders, getOrder
jest.mock("../../controllers/orders.controller.js", () => {
  return {
    createOrder: (req, res) => {
      const { items = [{ productId: 1, quantity: 2 }], total = 100000 } = req.body || {};
      return res.status(201).json({
        data: {
          id: 101,
          userId: req.user?.id ?? 1,
          items,
          total,
          status: "CREATED",
        },
      });
    },
    getOrders: (req, res) => {
      const userId = req.user?.id ?? 1;
      return res.status(200).json({
        data: [
          { id: 101, userId, total: 100000, status: "CREATED" },
          { id: 102, userId, total: 200000, status: "PAID" },
        ],
      });
    },
    getOrder: (req, res) => {
      const id = Number(req.params.id);
      return res.status(200).json({
        data: { id, userId: req.user?.id ?? 1, total: 150000, status: "CREATED" },
      });
    },
  };
});

const { loadApp, request } = require("./helpers/testUtils");

// ✅ Nếu app mount /api/orders thì để đúng như dưới.
// Nếu app của bạn mount /api/order (không 's'), đổi thành: const API_BASE = "/api/order";
const API_BASE = "/api/orders";

describe("Orders Integration (verifyToken + OrdersController mocked)", () => {
  const app = loadApp();
  const agent = request(app);

  test("POST /orders -> 200/201 và trả order", async () => {
    const payload = {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      total: 300000,
    };

    const res = await agent.post(API_BASE).send(payload);

    expect([200, 201]).toContain(res.status);
    const body = res.body?.data || res.body;
    expect(body).toBeTruthy();
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        items: expect.any(Array),
        total: expect.any(Number),
        status: expect.any(String),
      })
    );
  });

  test("GET /orders -> 200 và trả danh sách", async () => {
    const res = await agent.get(API_BASE);
    expect(res.status).toBe(200);
    const list = res.body?.data || res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        status: expect.any(String),
      })
    );
  });

  test("GET /orders/:id -> 200 và trả 1 order", async () => {
    const res = await agent.get(`${API_BASE}/101`);
    expect([200, 304]).toContain(res.status);
    const body = res.body?.data || res.body;
    expect(body).toEqual(
      expect.objectContaining({
        id: 101,
        status: expect.any(String),
      })
    );
  });
});
