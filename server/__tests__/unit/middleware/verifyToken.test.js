
jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));
const jwt = require("jsonwebtoken");
const verifyToken = require("../../../middleware/verifyToken");

const mockReq = (headers = {}) => ({
  header: (key) => headers[key],
  get: (key) => headers[key], // in case middleware uses req.get
});
const mockRes = () => ({ });
const mockNext = () => jest.fn();

describe("middleware/verifyToken", () => {
  test("throws when token header is missing", () => {
    const req = mockReq({});
    const next = mockNext();
    expect(() => verifyToken(req, mockRes(), next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() and attaches req.user when token is valid", () => {
    jwt.verify.mockReturnValue({ id: 1, roles: "user" });
    const req = mockReq({ "auth-token": "abc" });
    const next = mockNext();
    verifyToken(req, mockRes(), next);
    expect(req.user).toEqual({ id: 1, roles: "user" });
    expect(next).toHaveBeenCalled();
  });

  test("throws when token is invalid", () => {
    jwt.verify.mockImplementation(() => { throw new Error("bad token"); });
    const req = mockReq({ "auth-token": "invalid" });
    const next = mockNext();
    expect(() => verifyToken(req, mockRes(), next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});