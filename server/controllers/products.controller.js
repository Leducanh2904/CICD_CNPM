const pool = require("../config");
const productService = require("../services/product.service");
const storeService = require("../services/store.service");  // ✅ Add import for store check

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
  console.log("🔍 CreateProduct: req.body =", req.body);  // ✅ Log body
  console.log("🔍 CreateProduct: req.file =", req.file ? req.file.filename : "No file");  // ✅ Log file
  try {
    const { name, price, stock, description, store_id } = req.body;  // ✅ Log store_id from form
    const image = req.file ? `/images/${req.file.filename}` : null;
    const slug = generateSlug(name);

    if (!slug) {
      return res.status(400).json({ message: "Invalid product name for slug" });
    }

    if (req.user.roles.toLowerCase() !== 'admin' && req.user.roles.toLowerCase() !== 'seller') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const data = {
      name,
      slug, 
      price: parseFloat(price), 
      stock: parseInt(stock) || 0, 
      description,
      image,
    };

    if (req.user.roles.toLowerCase() === 'seller') {
      const ownerStore = await storeService.getStoreByOwner(req.user.user_id || req.user.id);
      if (!ownerStore) {
        return res.status(403).json({ message: "Seller has no store" });
      }
      data.store_id = ownerStore.id;  // ✅ Override with owner's store, ignore form store_id for security
      console.log(`🔍 Seller ${req.user.id} using store_id ${data.store_id}`);  // ✅ Log
    } else {
      // Admin: Use form store_id if provided
      if (store_id) data.store_id = parseInt(store_id);
    }

    const newProduct = await productService.addProduct(data);
    res.status(201).json(newProduct); 
  } catch (error) {
    console.error('🔍 Create product error:', error);  // ✅ Enhanced log
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
  console.log("🔍 UpdateProduct: req.body =", req.body);  // ✅ Log body
  console.log("🔍 UpdateProduct: req.file =", req.file ? req.file.filename : "No file");  // ✅ Log file
  console.log("🔍 UpdateProduct: slug =", req.params.slug);  // ✅ Log slug
  try {
    const { name, price, stock, description, store_id } = req.body;
    const { slug: oldSlug } = req.params;
    const currentProduct = await productService.getProductBySlug(oldSlug);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    const image = req.file ? `/images/${req.file.filename}` : currentProduct.image_url;
    const newSlug = generateSlug(name) || currentProduct.slug; 

    if (req.user.roles.toLowerCase() !== 'admin') {
      if (req.user.roles.toLowerCase() !== 'seller') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      // ✅ SỬA: Dùng getStoreByOwner (không filter active) thay vì getStoreById
      const ownerStore = await storeService.getStoreByOwner(req.user.user_id || req.user.id);
      if (!ownerStore || currentProduct.store_id !== ownerStore.id) {
        console.log(`🔍 Update fail: Seller ${req.user.id} product store ${currentProduct.store_id} vs owner store ${ownerStore ? ownerStore.id : 'null'}`);  // ✅ Log debug
        return res.status(403).json({ message: "Not your product" });
      }
      console.log(`🔍 Seller ${req.user.id} owns product via store ${ownerStore.id}`);  // ✅ Log
    }

    const updatedData = {
      id: currentProduct.id,  
      name: name || currentProduct.name,
      slug: newSlug,  
      price: parseFloat(price) || currentProduct.price,
      stock: parseInt(stock) || currentProduct.stock,
      description: description || currentProduct.description,
      image,
    };

    // Admin can change store_id if provided
    if (req.user.roles.toLowerCase() === 'admin' && store_id) {
      updatedData.store_id = parseInt(store_id);
    }

    const updatedProduct = await productService.updateProduct(updatedData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('🔍 Update product error:', error);  // ✅ Enhanced log
    res.status(error.statusCode || 500).json({ message: "Error updating product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  console.log("🔍 DeleteProduct: slug =", req.params.slug);  // ✅ Log slug
  console.log("🔍 DeleteProduct: user =", req.user);  // ✅ Log user
  try {
    const { slug } = req.params;
    const productToDelete = await productService.getProductBySlug(slug); 
    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.roles.toLowerCase() !== 'admin') {
      if (req.user.roles.toLowerCase() !== 'seller') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      // ✅ SỬA: Dùng getStoreByOwner (không filter active) thay vì getStoreById
      const ownerStore = await storeService.getStoreByOwner(req.user.user_id || req.user.id);
      if (!ownerStore || productToDelete.store_id !== ownerStore.id) {
        console.log(`🔍 Delete fail: Seller ${req.user.id} product store ${productToDelete.store_id} vs owner store ${ownerStore ? ownerStore.id : 'null'}`);  // ✅ Log debug
        return res.status(403).json({ message: "Not your product" });
      }
      console.log(`🔍 Seller ${req.user.id} owns product ${slug} via store ${ownerStore.id}`);  // ✅ Log success
    }

    const deletedProduct = await productService.removeProduct(productToDelete.id); 
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error('🔍 Delete product error:', error);  // ✅ Enhanced log
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
      `SELECT users.fullname as name, reviews.* FROM reviews  
        JOIN users
        ON users.user_id = reviews.user_id  
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
      `INSERT INTO reviews(user_id, product_id, comment, rating)  
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

// ✅ Add function (unchanged)
const getStoreProducts = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { page = 1 } = req.query;
    const products = await productService.getProductsByStore(store_id, page);
    res.json(products);
  } catch (error) {
    console.error('Get store products error:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
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
  getStoreProducts,  // ✅ Add
};