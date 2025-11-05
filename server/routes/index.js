// routes/index.js (cập nhật)
const router = require("express").Router();
const cart = require("./cart");
const order = require("./order");
const product = require("./product");
const users = require("./users");
const auth = require("./auth");
const payment = require("./payment");
const swaggerUi = require("swagger-ui-express");
const docs = require("../docs");
const upload = require("./upload");
const stores = require("./stores");

router.use("/auth", auth);
router.use("/users", users);
router.use("/products", product);
router.use("/orders", order);
router.use("/cart", cart);
router.use("/payment", payment);
router.use("/docs", swaggerUi.serve, swaggerUi.setup(docs));
router.use("/upload", upload);
router.use("/stores", stores);

module.exports = router;