const express = require("express");
const router = express.Router();
const { getAllStores, getStoreById } = require("../controllers/store.controller");
const productService = require("../services/product.service");

router.route("/").get(getAllStores);

router.route("/:id").get(getStoreById);

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