
const verifySeller = require("../../../middleware/verifySeller");

const res = {};
const mkNext = () => jest.fn();

describe("middleware/verifySeller", () => {
  test("passes when user has seller role (case-insensitive)", () => {
    const next = mkNext();
    verifySeller({ user: { roles: "SeLLeR" } }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const [arg] = next.mock.calls[0];
    expect(arg).toBeUndefined(); // no error
  });

  test("calls next with Unauthorized error when user missing", () => {
    const next = mkNext();
    verifySeller({}, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const [err] = next.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect(String(err)).toMatch(/Unauthorized/i);
  });

  test("calls next with Access denied error when role is not seller", () => {
    const next = mkNext();
    verifySeller({ user: { roles: "user" } }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const [err] = next.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect(String(err)).toMatch(/Access denied|Seller only/i);
  });
});
