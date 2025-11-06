const {
  createOrderDb,
  getAllOrdersDb,
  getOrderDb,
  updateOrderStatusDb,
  getAllOrdersDbAdmin, 
  getAllOrdersDbSeller, 
  updateOrderStatusDbSeller,  
  getOrderDbBySeller,
  getTotalOrdersDb, 
  getRevenueStatsDb,  
  getTotalDeliveredOrdersForStoreDb,
  getStoreRevenueStatsDb,
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

getOrderBySeller = async (orderId, storeId) => {
    try {
      const order = await getOrderDbBySeller({ orderId, storeId });
      if (!order) {
        throw new ErrorHandler(404, "Order not found or not yours");
      }
      order.password = undefined;
      return order;  
    } catch (error) {
      console.error('Service Error in getOrderBySeller:', error);
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

  // ✅ New: Seller's orders (filter by store products)
  getAllOrdersSeller = async (storeId, page) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      return await getAllOrdersDbSeller({ storeId, limit, offset });
    } catch (error) {
      console.error('Service Error in getAllOrdersSeller:', error);
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

  // ✅ New: Update status for seller (check ownership via owner_id)
  updateOrderStatusSeller = async (ref, status, ownerId) => {
    try {
      return await updateOrderStatusDbSeller({ ref, status, ownerId });
    } catch (error) {
      console.error('Service Error in updateOrderStatusSeller:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // ✅ Thêm 4 method này VÀO TRONG class (indent 2 spaces)
  getTotalOrders = async () => {
    try {
      return await getTotalOrdersDb();
    } catch (error) {
      console.error('Service Error in getTotalOrders:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  getRevenueStats = async ({ fromDate, toDate, storeId } = {}) => {
    try {
      console.log('🔍 Service params:', { fromDate, toDate, storeId });  // Debug
      const data = await getRevenueStatsDb({ fromDate, toDate, storeId });
      console.log('🔍 Service revenue length:', data.length);  // Debug
      return data;
    } catch (error) {
      console.error('Service Error in getRevenueStats:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  getTotalDeliveredOrdersForStore = async (storeId) => {
    try {
      return await getTotalDeliveredOrdersForStoreDb({ storeId });
    } catch (error) {
      console.error('Service Error in getTotalDeliveredOrdersForStore:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  getStoreRevenueStats = async (storeId) => {
    try {
      return await getStoreRevenueStatsDb({ storeId });
    } catch (error) {
      console.error('Service Error in getStoreRevenueStats:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}  

module.exports = new OrderService();