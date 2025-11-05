const { ErrorHandler } = require("../helpers/error");
const orderService = require("./order.service");

class PaymentService {
  createIntent = async (data) => {
    try {
      const { amount, orderRef } = data;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Pay+Order+${orderRef}+${amount}VND`;
      return { qrUrl, orderRef };
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  };

  verify = async (orderRef, userId) => {
    try {
      const result = await orderService.updateOrderStatus(orderRef, 'paid', userId);
      return { success: true, ...result };
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  };
}

module.exports = new PaymentService();