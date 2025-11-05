const request = require("supertest");
const app = require("../../app");
const jwt = require("jsonwebtoken");

function makeToken(payload = { user_id: 4, roles: "user" }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

describe("Order integration", () => {
  test("Thêm cart item → tạo order thành công", async () => {
    const token = makeToken();

    // thêm vào giỏ (đổi product_id theo seed của bạn)
    await request(app)
      .post("/api/cart/add")
      .set("auth-token", token)
      .send({ product_id: 3, quantity: 1 })
      .expect(200);

    const createRes = await request(app)
      .post("/api/orders")
      .set("auth-token", token)
      .send({
        userId: 4,
        amount: 170000,
        itemTotal: 170000,
        paymentMethod: "qr",
        ref: "ORDER-TEST-INT-1",
        addressData: {}
      })
      .expect(201);

    expect(createRes.body).toHaveProperty("id");
    expect(createRes.body).toHaveProperty("status");
  }, 30000);
});
