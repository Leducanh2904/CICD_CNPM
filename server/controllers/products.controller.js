const pool = require("../config");
const productService = require("../services/product.service");

const generateSlug = (name) => {
  if (!name) return null;
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_-]+/g, '-')  
    .replace(/^-+|-+$/g, '');  
};

const getAllProducts = async (req, res) => {
  const { page = 1 } = req.query;
  const products = await productService.getAllProducts(page);
  res.json(products);
};

const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const slug = generateSlug(name);

    if (!slug) {
      return res.status(400).json({ message: "Invalid product name for slug" });
    }

    const newProduct = await productService.addProduct({
      name,
      slug, 
      price: parseFloat(price), 
      stock: parseInt(stock) || 0, 
      description,
      image,
    });

    res.status(201).json(newProduct); 
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;  
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const product = await productService.getProductByName(name);
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product by name error:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const { slug: oldSlug } = req.params;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const newSlug = generateSlug(name); 

    if (!newSlug) {
      return res.status(400).json({ message: "Invalid product name for slug" });
    }

    const currentProduct = await productService.getProductBySlug(oldSlug);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await productService.updateProduct({
      id: currentProduct.id,  
      name,
      slug: newSlug,  
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description,
      image,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(error.statusCode || 500).json({ message: "Error updating product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const productToDelete = await productService.getProductBySlug(slug); 
    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    const deletedProduct = await productService.removeProduct(productToDelete.id); 
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(error.statusCode || 500).json({ message: "Error deleting product", error: error.message });
  }
};


const getProductReviews = async (req, res) => {
  const { product_id, user_id } = req.query;
  try {
    const reviewExist = await pool.query(
      "SELECT EXISTS (SELECT * FROM reviews where product_id = $1 and user_id = $2)",
      [product_id, user_id]
    );

    const reviews = await pool.query(
      `SELECT users.fullname as name, reviews.* FROM reviews  -- ✅ Fix: users.fullname thay vì users.name
        JOIN users
        ON users.user_id = reviews.user_id  -- ✅ Fix: user_id thay vì id
        WHERE product_id = $1`,
      [product_id]
    );

    res.status(200).json({
      reviewExist: reviewExist.rows[0].exists,
      reviews: reviews.rows,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

const createProductReview = async (req, res) => {
  const { product_id, content, rating } = req.body;
  const user_id = req.user.user_id || req.user.id; 

  try {
    const result = await pool.query(
      `INSERT INTO reviews(user_id, product_id, comment, rating)  -- ✅ Fix: comment thay vì content
       VALUES($1, $2, $3, $4) returning *`,
      [user_id, product_id, content, rating]
    );
    res.status(201).json(result.rows[0]); 
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.detail || error.message });
  }
};

const updateProductReview = async (req, res) => {
  const { content, rating, id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reviews set comment = $1, rating = $2 where id = $3 returning *`,  
      [content, rating, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllProducts,
  createProduct,
  getProduct,
  getProductBySlug,
  getProductByName,
  updateProduct,
  deleteProduct,
  getProductReviews,
  createProductReview,
  updateProductReview,
  // getStoreProducts, 
};