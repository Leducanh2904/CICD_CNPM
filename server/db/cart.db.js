const pool = require("../config");

const createCartDb = async (userId) => {
  return { message: 'Cart ready', user_id: userId };
};

const getCartDb = async (userId) => {
  const { rows: cart } = await pool.query(
    `SELECT 
       c.id, c.user_id, c.product_id, c.quantity, c.created_at,
       p.name, p.slug, p.price, p.stock, p.description, p.image_url,
       ROUND((p.price * c.quantity)::numeric, 2) AS subtotal
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );
  return cart;
};

// addItemDb - FIXED: Table cart, ON CONFLICT (user_id, product_id), + quantity param
const addItemDb = async ({ user_id, product_id, quantity = 1 }) => {
  try {
    const { rows: [result] } = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart.quantity + $3
       RETURNING *`,
      [user_id, product_id, quantity]
    );

    // Return full cart sau add
    return await getCartDb(user_id);
  } catch (error) {
    console.error('DB Error in addItemDb:', error);
    throw error;
  }
};

// deleteItemDb - FIXED: Table cart, WHERE user_id + product_id
const deleteItemDb = async ({ user_id, product_id }) => {
  try {
    const { rows: [result] } = await pool.query(
      "DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [user_id, product_id]
    );
    return result || null;
  } catch (error) {
    console.error('DB Error in deleteItemDb:', error);
    throw error;
  }
};

// increaseItemQuantityDb - FIXED: Table cart, +1, return full cart
const increaseItemQuantityDb = async ({ user_id, product_id }) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (rowCount === 0) {
      throw new Error('Item không tồn tại');
    }

    return await getCartDb(user_id);
  } catch (error) {
    console.error('DB Error in increaseItemQuantityDb:', error);
    throw error;
  }
};

// decreaseItemQuantityDb - FIXED: Table cart, -1 min 1, return full cart
const decreaseItemQuantityDb = async ({ user_id, product_id }) => {
  try {
    const { rows: [result] } = await pool.query(
      "UPDATE cart SET quantity = GREATEST(1, quantity - 1) WHERE user_id = $1 AND product_id = $2 RETURNING *",
      [user_id, product_id]
    );

    if (!result) {
      throw new Error('Item không tồn tại');
    }

    return await getCartDb(user_id);
  } catch (error) {
    console.error('DB Error in decreaseItemQuantityDb:', error);
    throw error;
  }
};

const emptyCartDb = async (userId) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM cart WHERE user_id = $1",
      [userId]
    );
    return { deleted: rowCount };
  } catch (error) {
    console.error('DB Error in emptyCartDb:', error);
    throw error;
  }
};

// THÊM MỚI: getCartCountDb - Đếm số items trong cart (cho check empty trước tạo order)
const getCartCountDb = async (userId) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM cart WHERE user_id = $1',
      [userId]
    );
    return parseInt(rows[0].count);
  } catch (error) {
    console.error('DB Error in getCartCountDb:', error);
    throw error;
  }
};

module.exports = {
  createCartDb,
  getCartDb,
  addItemDb,
  deleteItemDb,
  increaseItemQuantityDb,
  decreaseItemQuantityDb,
  emptyCartDb,
  getCartCountDb,
};