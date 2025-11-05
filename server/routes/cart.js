

const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");  // Đảm bảo middleware set req.user = { id: ... }
const {
  getCart,
  addItem,
  deleteItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearCart,
} = require("../controllers/cart.controller");

router.use(verifyToken);

router.route("/").get(getCart);
router.route("/add").post(addItem);  // Body: { product_id, quantity }
router.route("/delete").delete(deleteItem);  // Body: { product_id }
router.route("/increment").put(increaseItemQuantity);  // Body: { product_id }
router.route("/decrement").put(decreaseItemQuantity);  // Body: { product_id }
router.route("/clear").post(clearCart);
module.exports = router;