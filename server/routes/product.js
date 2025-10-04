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
  // getStoreProducts,  
} = require("../controllers/products.controller");

const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_") 
    );
  },
});

const upload = multer({ storage: storage });


router
  .route("/")
  .get(getAllProducts)
  .post(verifyToken, verifyAdmin, upload.single("image"), createProduct);

router
  .route("/:slug")
  .get(getProductBySlug)
  .put(verifyToken, verifyAdmin, upload.single("image"), updateProduct)
  .delete(verifyToken, verifyAdmin, deleteProduct);

router.route("/id/:id").get(getProduct);

router.route("/name/:name").get(getProductByName);

router
  .route("/:id/reviews")
  .get(getProductReviews)
  .post(verifyToken, createProductReview)
  .put(verifyToken, updateProductReview);

//router.route("/:store_id").get(getStoreProducts); 

module.exports = router;