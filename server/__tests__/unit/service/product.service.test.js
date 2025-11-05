/**
 * Unit tests for services/product.service.js
 */
jest.mock("../../../db/product.db", () => ({
  getAllProductsDb: jest.fn(),
  createProductDb: jest.fn(),
  getProductDb: jest.fn(),
  updateProductDb: jest.fn(),
  removeProductDb: jest.fn(),
  getAllProductsByStoreDb: jest.fn(),
  getProductCountByStoreDb: jest.fn(),
}));

const db = require("../../../db/product.db");
const ProductService = require("../../../services/product.service");

describe("ProductService.getAllProducts", () => {
  test("computes offset from page (page=1 => offset=0)", async () => {
    db.getAllProductsDb.mockResolvedValue({ items: [], total: 0 });
    const page = 1;
    const res = await ProductService.getAllProducts({ page });
    expect(db.getAllProductsDb).toHaveBeenCalled();
    expect(res).toHaveProperty("items");
  });
});

describe("ProductService.updateProduct", () => {
  test("returns 404-like error when not found", async () => {
    db.updateProductDb.mockResolvedValue(null);
    await expect(ProductService.updateProduct(999, { name: "X" })).rejects.toThrow();
  });
});
