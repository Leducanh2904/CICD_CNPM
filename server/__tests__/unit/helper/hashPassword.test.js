// DÙNG bcryptjs thay cho bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(async () => 'salt'),
  // Trả về "hashed(<pwd>)" đúng với expected trong test
  hash: jest.fn(async (pwd /*, salt */) => `hashed(${pwd})`),
  // So sánh theo format ở trên
  compare: jest.fn(async (pwd, hash) => hash === `hashed(${pwd})`)
}));

const bcrypt = require('bcryptjs');
const { hashPassword, comparePassword } = require('../../../helpers/hashPassword');

describe('helpers/hashPassword (async)', () => {
  test('hashPassword produces a different string', async () => {
    const hashed = await hashPassword('secret');
    expect(hashed).toBe('hashed(secret)');     // ✅ sẽ pass
    expect(bcrypt.genSalt).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  test('comparePassword validates correct password', async () => {
    const ok  = await comparePassword('secret', 'hashed(secret)');
    const bad = await comparePassword('wrong',  'hashed(secret)');
    expect(ok).toBe(true);                     // ✅ sẽ pass
    expect(bad).toBe(false);
  });
});
