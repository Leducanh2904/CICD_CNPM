const { createIntent, verify } = require("../controllers/payment.controller");
const verifyToken = require("../middleware/verifyToken");  // Cho createIntent

const router = require("express").Router();

router.route("/create-intent").post(verifyToken, createIntent);  // Thêm

router.route("/verify").post(verify, verify);  

module.exports = router;