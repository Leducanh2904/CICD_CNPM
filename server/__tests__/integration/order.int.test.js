/**
 * server/__tests__/integration/order.int.test.js
 * Integration (controllers mocked) — KHÔNG sửa code nguồn.
 */
const request = require("supertest");

const API_PREFIX = "/api";

/* ---------- Mocks PHẢI đặt trước khi require app ---------- */
jest.doMock("../../controllers/cart.controller", () => {
  const ok = (res, data, status = 200) => res.status(status).json({ data });
  return {
    getCart: (_req, res) => ok(res, { items: [{ productId: 1, quantity: 2 }] }),
    addItem: (req, res) => {
      const { productId = 10, quantity = 1 } = req.body || {};
      return ok(res, { items: [{ productId, quantity }] });
    },
    deleteItem: (_req, res) => ok(res, { deleted: true }),
    increaseItemQuantity: (_req, res) => ok(res, { ok: true }),
    decreaseItemQuantity: (_req, res) => ok(res, { ok: true }),
    clearCart: (_req, res) => ok(res, { ok: true }),
  };
});

jest.doMock("../../controllers/orders.controller", () => {
  const ok = (res, data, status = 200) => res.status(status).json({ data });
  return {
    createOrder: (req, res) =>
      ok(
        res,
        {
          id: 101,
          userId: req.user?.id ?? 1,
          items: [{ productId: 10, quantity: 3 }],
          total: 300000,
          status: "CREATED",
        },
        201
      ),
    getAllOrders: (req, res) =>
      ok(res, [
        { id: 101, userId: req.user?.id ?? 1, total: 100000, status: "CREATED" },
        { id: 102, userId: req.user?.id ?? 1, total: 200000, status: "PAID" },
      ]),
    getOrders: (req, res) =>
      ok(res, [
        { id: 101, userId: req.user?.id ?? 1, total: 100000, status: "CREATED" },
        { id: 102, userId: req.user?.id ?? 1, total: 200000, status: "PAID" },
      ]),
    getOrder: (req, res) =>
      ok(res, {
        id: Number(req.params.id) || 101,
        userId: req.user?.id ?? 1,
        total: 150000,
        status: "CREATED",
      }),
    updateStatus: (_req, res) => ok(res, { ok: true }),
    getAllOrdersAdmin: (_req, res) => ok(res, []),
    getAllOrdersSeller: (_req, res) => ok(res, []),
    getAdminStats: (_req, res) => ok(res, { total: 0 }),
    getSellerStats: (_req, res) => ok(res, { total: 0 }),
  };
});

// Mock middleware auth để gắn req.user, tránh reject
// Dự án thật dùng server/middleware/verifyToken.js (export là 1 hàm).
// Mock trả về 1 hàm, đồng thời thêm named export verifyToken để
// an toàn với cả 2 kiểu import (default hoặc destructuring).
jest.doMock("../../middleware/verifyToken", () => {
  const fn = (req, _res, next) => {
    req.user = { id: 1, role: "USER" };
    next();
  };
  return Object.assign(fn, { verifyToken: fn });
});

/* ---------- Sau khi mock xong mới require app ---------- */
let app;
beforeAll(() => {
  jest.resetModules(); // đảm bảo dùng bản mock vừa đăng ký
  app = require("../../app");
});

const setToken = (rq) => rq.set("Authorization", "Bearer test-token");

describe("Orders Integration (mocked controllers)", () => {
  test("POST /cart/add rồi POST /orders -> 200/201 và có id", async () => {
    const agent = request(app);

    const add = await setToken(
      agent.post(`${API_PREFIX}/cart/add`).send({ productId: 10, quantity: 2 })
    );
    expect(add.status).toBe(200);

    const res = await setToken(agent.post(`${API_PREFIX}/orders`).send({}));
    expect([200, 201]).toContain(res.status);

    const order = res.body?.data || res.body;
    expect(order).toEqual(expect.objectContaining({ id: expect.any(Number) }));
  });

  test("GET /orders -> 200 có list", async () => {
    const agent = request(app);
    const res = await setToken(agent.get(`${API_PREFIX}/orders`));
    expect(res.status).toBe(200);
    const list = res.body?.data ?? res.body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  test("GET /orders/:id -> 200 có order", async () => {
    const agent = request(app);
    const created = await setToken(agent.post(`${API_PREFIX}/orders`).send({}));
    const order = created.body?.data || created.body;

    const res = await setToken(agent.get(`${API_PREFIX}/orders/${order.id}`));
    expect([200, 304]).toContain(res.status);
    const body = res.body?.data || res.body;
    expect(body).toEqual(expect.objectContaining({ id: order.id }));
  });
});
