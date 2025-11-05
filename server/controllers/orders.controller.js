const orderService = require("../services/order.service");
const storeService = require("../services/store.service");  
const cartService = require("../services/cart.service");
const userService = require("../services/user.service");

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

// ✅ New: Seller's orders
const getAllOrdersSeller = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const store = await storeService.getStoreByOwner(req.user.user_id || req.user.id);
    if (!store) {
      return res.status(404).json({ error: 'No store found for seller' });
    }
    const orders = await orderService.getAllOrdersSeller(store.id, parseInt(page));
    res.json(orders);
  } catch (error) {
    console.error('Controller Error in getAllOrdersSeller:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    let order;
    if (user.roles.toLowerCase() === 'seller') {
      // ✅ Seller: Check ownership via store
      const store = await storeService.getStoreByOwner(user.user_id || user.id);
      if (!store) {
        return res.status(403).json({ error: 'No store for seller' });
      }
      order = await orderService.getOrderBySeller(id, store.id);  // ✅ New method: getOrderBySeller
    } else {
      // User/Admin: Original check
      order = await orderService.getOrderById({ id, userId: user.id });
    }
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
    const user = req.user;
    let updated;
    if (user.roles.toLowerCase() === 'seller') {
      updated = await orderService.updateOrderStatusSeller(ref, status, user.user_id || user.id);  // ✅ Use seller method
      // ✅ Refetch full order after update for frontend
      const store = await storeService.getStoreByOwner(user.user_id || user.id);
      updated = await orderService.getOrderBySeller(updated.id, store.id);  // Return full updated order
    } else {
      updated = await orderService.updateOrderStatus(ref, status, user.user_id || user.id);
    }
    res.json(updated);  // ✅ Return full order (with items, etc.)
  } catch (error) {
    console.error('Controller Error in updateStatus:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    console.log('🔍 Full req.query:', req.query);  // ✅ DEBUG: Full raw query to see key
    const { from_date, to_date, store_id, storeId } = req.query;  // ✅ FIX: Dual destructuring (lowercase + camel)
    const storeIdNum = store_id ? parseInt(store_id) : (storeId ? parseInt(storeId) : null);  // ✅ FIX: Parse safe
    console.log('🔍 Destructured params:', { from_date, to_date, store_id, storeId, storeIdNum });  // Debug
    const totalUsers = await userService.getTotalUsers();
    const totalOrders = await orderService.getTotalOrders();
    const totalStores = await storeService.getTotalStores();
    const revenueStats = await orderService.getRevenueStats({ 
      fromDate: from_date, 
      toDate: to_date, 
      storeId: storeIdNum  // ✅ Pass parsed number
    });
    console.log('🔍 Revenue stats length:', revenueStats.length);  // Debug
    res.json({ totalUsers, totalOrders, totalStores, revenueStats });
  } catch (error) {
    console.error('Controller Error in getAdminStats:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const getSellerStats = async (req, res) => {
  try {
    const store = await storeService.getStoreByOwner(req.user.user_id || req.user.id);
    if (!store) {
      return res.status(404).json({ error: 'No store found for seller' });
    }
    const totalOrders = await orderService.getTotalDeliveredOrdersForStore(store.id);
    const revenueStats = await orderService.getStoreRevenueStats(store.id);
    res.json({ totalOrders, revenueStats });
  } catch (error) {
    console.error('Controller Error in getSellerStats:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getAllOrdersAdmin, 
  getOrder,
  updateStatus,
  getAllOrdersSeller,  
  getAdminStats,
  getSellerStats,
};