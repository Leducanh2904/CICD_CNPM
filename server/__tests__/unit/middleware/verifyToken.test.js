// server/__tests__/middleware/verifyToken.test.js
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));
const jwt = require("jsonwebtoken");
const verifyToken = require("../../../middleware/verifyToken");

const mockReq = (headers = {}) => ({
  header: (key) => headers[key] ?? headers[key?.toLowerCase()],
  get:    (key) => headers[key] ?? headers[key?.toLowerCase()],
});
const mockRes = () => ({});
const mockNext = () => jest.fn();

describe("middleware/verifyToken", () => {
  test("gọi next(ErrorHandler 401) khi thiếu token header", () => {
    const req = mockReq({});
    const next = mockNext();

    verifyToken(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toEqual(expect.objectContaining({ statusCode: 401 }));
  });

  test("next() & gắn req.user khi token hợp lệ", () => {
    jwt.verify.mockReturnValue({ id: 1, roles: "user" });
    const req = mockReq({ "auth-token": "abc" });
    const next = mockNext();

    verifyToken(req, mockRes(), next);

    expect(req.user).toEqual(expect.objectContaining({ id: 1, roles: "user" }));
    // middleware của bạn còn normalize user_id nữa thì cũng ok:
    // expect(req.user.user_id).toBe(1);
    expect(next).toHaveBeenCalledWith(); // gọi next() không đối số
  });

  test("gọi next(ErrorHandler 401) khi token sai", () => {
    jwt.verify.mockImplementation(() => { throw new Error("bad token"); });
    const req = mockReq({ "auth-token": "invalid" });
    const next = mockNext();

    verifyToken(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toEqual(expect.objectContaining({ statusCode: 401 }));
  });
});
