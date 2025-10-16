const {
  createCartDb,
  getCartDb,
  addItemDb,
  deleteItemDb,
  increaseItemQuantityDb,
  decreaseItemQuantityDb,
  emptyCartDb,
  getCartCountDb,  // Thêm import
} = require("../db/cart.db");
const { ErrorHandler } = require("../helpers/error");

class CartService {
  createCart = async (userId) => {
    try {
      // Không cần explicit create (addItem sẽ tự insert nếu chưa có), nhưng giữ để tương thích
      return await createCartDb(userId);
    } catch (error) {
      console.error('Service Error in createCart:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  getCart = async (userId) => {
    try {
      if (!userId) {
        throw new ErrorHandler(400, 'Thiếu user_id');
      }
      return await getCartDb(userId);
    } catch (error) {
      console.error('Service Error in getCart:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  addItem = async (data) => {
    try {
      const { user_id, product_id, quantity = 1 } = data;
      if (!user_id || !product_id) {
        throw new ErrorHandler(400, 'Thiếu user_id hoặc product_id');
      }
      return await addItemDb({ user_id, product_id, quantity });
    } catch (error) {
      console.error('Service Error in addItem:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  removeItem = async (data) => {
    try {
      const { user_id, product_id } = data;
      if (!user_id || !product_id) {
        throw new ErrorHandler(400, 'Thiếu user_id hoặc product_id');
      }
      return await deleteItemDb({ user_id, product_id });
    } catch (error) {
      console.error('Service Error in removeItem:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  increaseQuantity = async (data) => {
    try {
      const { user_id, product_id } = data;
      if (!user_id || !product_id) {
        throw new ErrorHandler(400, 'Thiếu user_id hoặc product_id');
      }
      return await increaseItemQuantityDb({ user_id, product_id });
    } catch (error) {
      console.error('Service Error in increaseQuantity:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  decreaseQuantity = async (data) => {
    try {
      const { user_id, product_id } = data;
      if (!user_id || !product_id) {
        throw new ErrorHandler(400, 'Thiếu user_id hoặc product_id');
      }
      return await decreaseItemQuantityDb({ user_id, product_id });
    } catch (error) {
      console.error('Service Error in decreaseQuantity:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  clearCart = async (userId) => {  // Đổi tên từ emptyCart thành clearCart để match controller
    try {
      if (!userId) {
        throw new ErrorHandler(400, 'Thiếu user_id');
      }
      return await emptyCartDb(userId);
    } catch (error) {
      console.error('Service Error in clearCart:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };

  // THÊM MỚI: getCartCount - Đếm số items (cho check empty trong orders)
  getCartCount = async (userId) => {
    try {
      if (!userId) {
        throw new ErrorHandler(400, 'Thiếu user_id');
      }
      return await getCartCountDb(userId);
    } catch (error) {
      console.error('Service Error in getCartCount:', error);
      throw new ErrorHandler(error.statusCode || 500, error.message);
    }
  };
}

module.exports = new CartService();