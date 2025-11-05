const express = require("express");
const router = express.Router();
const { getAllStores, getStoreById, createStore, updateStore, deleteStore, getMyStore } = require("../controllers/store.controller");  // ✅ Add getMyStore
const productService = require("../services/product.service");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

// Apply verifyToken to all routes first
router.use(verifyToken);

// GET/POST /stores
router.route("/").get(getAllStores).post(verifyAdmin, createStore);

// ✅ Add: Get own store for seller (BEFORE /:id to avoid matching "my" as id)
router.route("/my").get(getMyStore);

// GET/PUT/DELETE /stores/:id (after /my to avoid intercept)
router.route("/:id").get(getStoreById).put(verifyAdmin, updateStore).delete(verifyAdmin, deleteStore);

// Products sub-route (after :id route)
router.use("/:id/products", (req, res, next) => {
  req.store_id = req.params.id; 
  next();
}, async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const result = await productService.getProductsByStore(req.store_id, parseInt(page));
    res.json(result);
  } catch (error) {
    console.error('Get store products error:', error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;