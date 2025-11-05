// server/__tests__/integration/auth.int.test.js
const request = require("supertest");
const app = require("../../app");
const jwt = require("jsonwebtoken");

describe("Auth integration (smoke)", () => {
  test("có thể ký và dùng JWT cho route bảo vệ", async () => {
    const token = jwt.sign(
      { user_id: 4, roles: "user" },             // payload hợp lệ theo middleware của bạn
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ví dụ gọi 1 route cần auth (đổi path cho đúng project)
    const res = await request(app)
      .get("/api/products")    // nếu route này không cần auth, bạn có thể gọi route require auth khác
      .set("auth-token", token)
      .expect(200);

    expect(res.body).toBeDefined();
  });
});
