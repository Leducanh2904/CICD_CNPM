const router = require("express").Router();
const {
  getOrder,
  getAllOrders,
  createOrder,
  updateStatus,
  getAllOrdersAdmin,  // New
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

module.exports = router;