// server/__tests__/integration/__mocks__/mail.service.js
module.exports = {
  sendMail: jest.fn().mockResolvedValue({ ok: true }),
};
