const request = require("supertest");
const app = require("../../app");

describe("Products integration", () => {
  test("GET /api/products trả danh sách", async () => {
    const res = await request(app).get("/api/products").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Kiểm tra có 1 product mẫu từ init.sql
    if (res.body.length) {
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("name");
    }
  });
});
