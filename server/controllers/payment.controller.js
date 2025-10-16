const paymentService = require("../services/payment.service");

const createIntent = async (req, res) => {
  try {
    const { amount, orderRef } = req.body;
    const intent = await paymentService.createIntent({ amount, orderRef });
    res.json(intent);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const { orderRef } = req.body;
    const userId = req.user?.id || 2;  // Fallback test userId=2 (john)
    const result = await paymentService.verify(orderRef, userId);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  createIntent,
  verify,
};