const express = require("express");
const router = express.Router();
<<<<<<< Updated upstream
const { getAllStores, getStoreById } = require("../controllers/store.controller");
const productService = require("../services/product.service");

router.route("/").get(getAllStores);

router.route("/:id").get(getStoreById);

=======
const { getAllStores, getStoreById, createStore, updateStore, deleteStore } = require("../controllers/store.controller");
const productService = require("../services/product.service");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

// Apply verifyToken to all routes first
router.use(verifyToken);

// GET/POST /stores
router.route("/").get(getAllStores).post(verifyAdmin, createStore);

// GET/PUT/DELETE /stores/:id (before /:id/products to avoid intercept)
router.route("/:id").get(getStoreById).put(verifyAdmin, updateStore).delete(verifyAdmin, deleteStore);

// Products sub-route (after :id route)
>>>>>>> Stashed changes
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