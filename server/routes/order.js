const router = require("express").Router();
const {
  getOrder,
  getAllOrders,
  createOrder,
  updateStatus,
  getAllOrdersAdmin, 
  getAllOrdersSeller, 
  getAdminStats,
  getSellerStats, 
} = require("../controllers/orders.controller");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.route("/create").post(verifyToken, createOrder);

// Giữ nguyên 100%: User's own
router.route("/").get(verifyToken, getAllOrders);

router.route("/:id").get(verifyToken, getOrder);

router.route("/:ref/status").patch(verifyToken, updateStatus);

// New: Admin all (thêm verifyToken trước verifyAdmin)
router.route("/admin/all").get(verifyToken, verifyAdmin, getAllOrdersAdmin);

// ✅ Add: Seller's orders
router.route("/seller/my").get(verifyToken, getAllOrdersSeller);

// New: Admin stats
router.route("/admin/stats").get(verifyToken, verifyAdmin, getAdminStats);

// New: Seller stats
router.route("/seller/stats").get(verifyToken, getSellerStats);
module.exports = router;