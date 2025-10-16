const {
  createOrderDb,
  getAllOrdersDb,
  getOrderDb,
  updateOrderStatusDb,
  getAllOrdersDbAdmin,  // Add import
} = require("../db/orders.db");
const cartService = require("./cart.service");
const { ErrorHandler } = require("../helpers/error");

class OrderService {
  createOrder = async (data) => {
    try {
      const { userId, amount, itemTotal, paymentMethod, ref, addressData } = data;
      if (!userId || !amount || !itemTotal || !paymentMethod || !ref) {
        throw new ErrorHandler(400, 'Missing userId, amount, itemTotal, paymentMethod, ref');
      }
      // Check cart không empty
      const cartCount = await cartService.getCartCount(userId);
      if (cartCount === 0) {
        throw new ErrorHandler(400, 'Cart is empty');
      }
      return await createOrderDb({ userId, amount, itemTotal, paymentMethod, ref, addressData });
    } catch (error) {
      console.error('Service Error in createOrder:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // Giữ nguyên 100%: User's own orders
  getAllOrders = async (userId, page) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    try {
      if (!userId) {
        throw new ErrorHandler(400, 'Missing userId');
      }
      return await getAllOrdersDb({ userId, limit, offset });
    } catch (error) {
      console.error('Service Error in getAllOrders:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // New: Separate admin all orders
  getAllOrdersAdmin = async (page) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      return await getAllOrdersDbAdmin({ limit, offset });
    } catch (error) {
      console.error('Service Error in getAllOrdersAdmin:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  getOrderById = async (data) => {
    try {
      if (!data.id || !data.userId) {
        throw new ErrorHandler(400, 'Missing id or userId');
      }
      const order = await getOrderDb(data);
      if (!order || order.length === 0) {
        throw new ErrorHandler(404, "Order does not exist");
      }
      return order;
    } catch (error) {
      console.error('Service Error in getOrderById:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  updateOrderStatus = async (ref, status, userId) => {
    try {
      return await updateOrderStatusDb({ ref, status, userId });
    } catch (error) {
      console.error('Service Error in updateOrderStatus:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}

module.exports = new OrderService();