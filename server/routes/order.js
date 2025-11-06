// server/routes/order.js
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Lấy controllers (có thể thiếu một số hàm tuỳ branch)
const ctrl = require("../controllers/orders.controller");

// Helper: nếu thiếu handler thì trả 501 thay vì crash
const ensure = (fn, name) =>
  typeof fn === "function"
    ? fn
    : (_req, res) => res.status(501).json({ error: `${name} not implemented` });

// Lấy từng handler kèm fallback
const createOrder = ensure(ctrl.createOrder, "createOrder");
const getOrder = ensure(ctrl.getOrder, "getOrder");

// Ưu tiên getAllOrders; nếu không có thì dùng getOrders
const listHandler = ensure(ctrl.getAllOrders || ctrl.getOrders, "getAllOrders/getOrders");

const updateStatus = ensure(ctrl.updateStatus, "updateStatus");
const getAllOrdersAdmin = ensure(ctrl.getAllOrdersAdmin, "getAllOrdersAdmin");
const getAllOrdersSeller = ensure(ctrl.getAllOrdersSeller, "getAllOrdersSeller");
const getAdminStats = ensure(ctrl.getAdminStats, "getAdminStats");
const getSellerStats = ensure(ctrl.getSellerStats, "getSellerStats");

/**
 * Thứ tự route: nên đặt route có prefix tĩnh (/admin, /seller) trước
 * để tránh va chạm với route động như /:id hay /:ref/status.
 */

// Admin: tất cả đơn
router.route("/admin/all").get(verifyToken, verifyAdmin, getAllOrdersAdmin);

// Admin stats
router.route("/admin/stats").get(verifyToken, verifyAdmin, getAdminStats);

// Seller: đơn của seller
router.route("/seller/my").get(verifyToken, getAllOrdersSeller);

// Seller stats
router.route("/seller/stats").get(verifyToken, getSellerStats);

// Tạo đơn (bạn đang dùng /create—giữ nguyên)
router.route("/create").post(verifyToken, createOrder);

// (Tùy chọn) hỗ trợ luôn POST /api/orders cho test khác nhánh
router.route("/").post(verifyToken, createOrder);

// Danh sách đơn của chính user
router.route("/").get(verifyToken, listHandler);

// Cập nhật trạng thái theo ref
router.route("/:ref/status").patch(verifyToken, updateStatus);

// Lấy 1 đơn theo id
router.route("/:id").get(verifyToken, getOrder);

module.exports = router;
