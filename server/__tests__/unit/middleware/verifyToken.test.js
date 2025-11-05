jest.mock("jsonwebtoken", () => ({ verify: jest.fn() }));
const jwt = require("jsonwebtoken");
const verifyToken = require("../../middleware/verifyToken");

function mockReq(headers = {}) { return { header: (k) => headers[k] }; }
function mockRes() { return {}; }
function mockNext() { return jest.fn(); }

test("missing token → 401", () => {
  const req = mockReq({});
  const next = mockNext();
  expect(() => verifyToken(req, mockRes(), next)).toThrow();
});

test("valid token → next()", () => {
  jwt.verify.mockReturnValue({ id: 1, roles: "user" });
  const req = mockReq({ "auth-token": "abc" });
  const next = mockNext();
  verifyToken(req, mockRes(), next);
  expect(req.user).toEqual({ id: 1, roles: "user" });
  expect(next).toHaveBeenCalled();
});
