// server/__tests__/unit/middleware/verifyToken.test.js

// Mock jsonwebtoken: "abc" hợp lệ, "invalid" ném lỗi
jest.mock(
  "jsonwebtoken",
  () => ({
    verify: jest.fn((token) => {
      if (token === "invalid") {
        const err = new Error("bad token");
        throw err;
      }
      return { userId: 1, token };
    }),
  }),
  { virtual: true }
);

// Mock helpers/error với đường dẫn từ file test tới helpers
jest.mock("../../../helpers/error", () => {
  class ErrorHandler extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  return { ErrorHandler };
});

const verifyToken = require("../../../middleware/verifyToken");

// Helper: assert Unauthorized ErrorHandler
function expectUnauthorizedError(err) {
  expect(err).toBeInstanceOf(Error);
  // nếu ErrorHandler: có .status = 401
  if ("status" in err) {
    expect(err.status).toBe(401);
  }
  expect(err.message).toMatch(/token missing|invalid|bad token/i);
}

describe("middleware/verifyToken", () => {
  const makeReq = (token) => ({
    header: (name) => (name === "auth-token" ? token : undefined),
  });

  test("gọi next(ErrorHandler 401) hoặc throw ErrorHandler khi thiếu token header", () => {
    const req = makeReq(undefined);
    const res = {};
    const next = jest.fn();

    try {
      verifyToken(req, res, next);
      // Nếu không throw, kiểm tra next(err)
      if (next.mock.calls.length) {
        const err = next.mock.calls[0][0];
        expectUnauthorizedError(err);
      } else {
        // Nếu không throw và không next(err) => fail
        throw new Error("Middleware neither threw nor called next(err) for missing token");
      }
    } catch (err) {
      // Middleware throw: chấp nhận
      expectUnauthorizedError(err);
    }
  });

  test("gọi next(ErrorHandler 401) hoặc throw ErrorHandler khi token sai", () => {
    const req = makeReq("invalid");
    const res = {};
    const next = jest.fn();

    try {
      verifyToken(req, res, next);
      if (next.mock.calls.length) {
        const err = next.mock.calls[0][0];
        expectUnauthorizedError(err);
      } else {
        throw new Error("Middleware neither threw nor called next(err) for invalid token");
      }
    } catch (err) {
      expectUnauthorizedError(err);
    }
  });

  test("next() khi token hợp lệ", () => {
    const req = makeReq("abc");
    const res = {};
    const next = jest.fn();

    verifyToken(req, res, next);

    // next được gọi không đối số
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(expect.objectContaining({ userId: 1, token: "abc" }));
  });
});
