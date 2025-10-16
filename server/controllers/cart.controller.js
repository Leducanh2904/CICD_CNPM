const cartService = require("../services/cart.service");

const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await cartService.getCart(userId);
    res.json({ items: cart });
  } catch (error) {
    console.error('Lỗi getCart:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// add item to cart - FIXED: Return { data: { items: cart } }
const addItem = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;
  try {
    const cart = await cartService.addItem({ user_id: userId, product_id, quantity });
    res.status(200).json({ data: { items: cart } });  // ✅ FIX: { data: { items: array } }
  } catch (error) {
    console.error('Lỗi addItem:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// delete item from cart - FIXED
const deleteItem = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;
  try {
    const data = await cartService.removeItem({ user_id: userId, product_id });
    res.status(200).json({ data: { items: data } });  // ✅ FIX: Return format
  } catch (error) {
    console.error('Lỗi deleteItem:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// increment item quantity by 1 - FIXED
const increaseItemQuantity = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;
  try {
    const cart = await cartService.increaseQuantity({ user_id: userId, product_id });
    res.json({ items: cart });  // ✅ FIX: Return array items
  } catch (error) {
    console.error('Lỗi increaseItemQuantity:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// decrement item quantity by 1 - FIXED
const decreaseItemQuantity = async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;
  try {
    const cart = await cartService.decreaseQuantity({ user_id: userId, product_id });
    res.json({ items: cart });  // ✅ FIX: Return array items
  } catch (error) {
    console.error('Lỗi decreaseItemQuantity:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

//clearCart: Xóa toàn bộ items trong cart của user
const clearCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await cartService.clearCart(userId);
    res.json({ message: 'Cart cleared successfully', deleted: result.deleted });
  } catch (error) {
    console.error('Lỗi clearCart:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  deleteItem,
  clearCart,
};