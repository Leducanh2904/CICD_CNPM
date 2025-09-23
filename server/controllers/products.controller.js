const pool = require("../config");
const productService = require("../services/product.service");

// Lấy tất cả sản phẩm (có phân trang)
const getAllProducts = async (req, res) => {
  const { page = 1 } = req.query;
  const products = await productService.getAllProducts(page);
  res.json(products);
};

// Tạo sản phẩm mới (có upload ảnh)
const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // lưu path ảnh

    const newProduct = await productService.addProduct({
      name,
      price,
      description,
      image,
    });

    res.status(200).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

// Lấy sản phẩm theo ID
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params);
  res.status(200).json(product);
};

// Lấy sản phẩm theo slug
const getProductBySlug = async (req, res) => {
  const product = await productService.getProductBySlug(req.params);
  res.status(200).json(product);
};

// Lấy sản phẩm theo tên
const getProductByName = async (req, res) => {
  const product = await productService.getProductByName(req.params);
  res.status(200).json(product);
};

// Cập nhật sản phẩm (có thể thay ảnh mới)
const updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const { slug } = req.params;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const updatedProduct = await productService.updateProduct({
      name,
      price,
      description,
      image,
      slug,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  const { slug } = req.params;
  const deletedProduct = await productService.removeProduct(slug);
  res.status(200).json(deletedProduct);
};

// ---------------- Reviews ----------------

// Lấy review của sản phẩm
const getProductReviews = async (req, res) => {
  const { product_id, user_id } = req.query;
  try {
    const reviewExist = await pool.query(
      "SELECT EXISTS (SELECT * FROM reviews where product_id = $1 and user_id = $2)",
      [product_id, user_id]
    );

    const reviews = await pool.query(
  `SELECT users.name as name, reviews.* FROM reviews
    JOIN users
    ON users.id = reviews.user_id
    WHERE product_id = $1`,
  [product_id]
);

    res.status(200).json({
      reviewExist: reviewExist.rows[0].exists,
      reviews: reviews.rows,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Thêm review mới
const createProductReview = async (req, res) => {
  const { product_id, content, rating } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO reviews(user_id, product_id, content, rating) 
       VALUES($1, $2, $3, $4) returning *`,
      [user_id, product_id, content, rating]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.detail);
  }
};

// Cập nhật review
const updateProductReview = async (req, res) => {
  const { content, rating, id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reviews set content = $1, rating = $2 where id = $3 returning *`,
      [content, rating, id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductByName,
  getProductBySlug,
  getProductReviews,
  updateProductReview,
  createProductReview,
};
