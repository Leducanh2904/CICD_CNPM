const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductByName,
  getProductReviews,
  createProductReview,
  updateProductReview,
  getProductBySlug,
  getStoreProducts,  // ✅ Add
} = require("../controllers/products.controller");

const verifyToken = require("../middleware/verifyToken");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + Math.random().toString(36).substring(7) + "-" + file.originalname.replace(/\s+/g, "_")  // ✅ Add random to avoid collision
    );
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // ✅ 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

router
  .route("/")
  .get(getAllProducts)
  .post(verifyToken, upload.single("image"), createProduct);  // ✅ multer handles multipart

router
  .route("/:slug")
  .get(getProductBySlug)
  .put(verifyToken, upload.single("image"), updateProduct)  // ✅ multer for PUT
  .delete(verifyToken, deleteProduct);  // ✅ No multer for DELETE

router.route("/id/:id").get(getProduct);

router.route("/name/:name").get(getProductByName);

router
  .route("/:id/reviews")
  .get(getProductReviews)
  .post(verifyToken, createProductReview)
  .put(verifyToken, updateProductReview);

// ✅ Add route for get products by store
router.route("/stores/:store_id/products").get(getStoreProducts);

module.exports = router;