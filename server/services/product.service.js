const {
  getAllProductsDb,
  createProductDb,
  getProductDb,
  updateProductDb,
  deleteProductDb,
  getProductBySlugDb,
  getAllProductsByStoreDb,
  getProductCountByStoreDb,
} = require("../db/product.db");
const { ErrorHandler } = require("../helpers/error");

class ProductService {
  getAllProducts = async (page) => {
    const limit = 12;
    const offset = (page - 1) * limit;
    try {
      return await getAllProductsDb({ limit, offset });
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  addProduct = async (data) => {
    try {
      return await createProductDb(data);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getProductById = async (id) => {
    try {
      const product = await getProductDb(id);
      if (!product) {
        throw new ErrorHandler(404, "product not found");
      }
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getProductBySlug = async (slug) => {
    try {
      const product = await getProductBySlugDb(slug);
      if (!product) {
        throw new ErrorHandler(404, "product not found");
      }
      return product;
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getProductByName = async (name) => {
    try {
      const product = await getProductByNameDb(name);
      if (!product) {
        throw new ErrorHandler(404, "product not found");
      }
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  updateProduct = async (data) => {
    try {
      const product = await getProductDb(data.id);
      if (!product) {
        throw new ErrorHandler(404, "product not found");
      }
      return await updateProductDb(data);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  removeProduct = async (id) => {
    try {
      const product = await getProductDb(id);
      if (!product) {
        throw new ErrorHandler(404, "product not found");
      }
      return await deleteProductDb(id);
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };

  getProductsByStore = async (store_id, page) => {
    const limit = 12;
    const offset = (page - 1) * limit;
    try {
      const products = await getAllProductsByStoreDb({ store_id, limit, offset });
      const totalItems = await getProductCountByStoreDb(store_id);
      return {
        success: true,
        data: products,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
      };
    } catch (error) {
      throw new ErrorHandler(500, error.message);
    }
  };
}

module.exports = new ProductService();