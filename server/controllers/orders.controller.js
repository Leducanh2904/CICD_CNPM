const orderService = require("../services/order.service");
const cartService = require("../services/cart.service");

const createOrder = async (req, res) => {
  try {
    const { amount, itemTotal, paymentMethod, ref, addressData } = req.body;
    const userId = req.user.id;

    if (!userId || !amount || !itemTotal || !paymentMethod || !ref || !addressData) {
      return res.status(400).json({ error: 'Missing required fields: amount, itemTotal, paymentMethod, ref, addressData' });
    }

    const newOrder = await orderService.createOrder({
      userId,
      amount,
      itemTotal,
      paymentMethod,
      ref,
      addressData,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Controller Error in createOrder:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Giữ nguyên 100%: User's own orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const userId = req.user.id;
    const orders = await orderService.getAllOrders(userId, parseInt(page));
    res.json(orders);
  } catch (error) {
    console.error('Controller Error in getAllOrders:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// New: Admin all orders (separate)
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const orders = await orderService.getAllOrdersAdmin(parseInt(page));
    res.json(orders);
  } catch (error) {
    console.error('Controller Error in getAllOrdersAdmin:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await orderService.getOrderById({ id, userId });
    res.json(order);
  } catch (error) {
    console.error('Controller Error in getOrder:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { ref } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const updated = await orderService.updateOrderStatus(ref, status, userId);
    res.json(updated);
  } catch (error) {
    console.error('Controller Error in updateStatus:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,  // Old
  getAllOrdersAdmin,  // New
  getOrder,
  updateStatus,
};