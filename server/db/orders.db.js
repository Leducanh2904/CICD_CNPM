// Updated server/db/order.db.js (add getAllOrdersDbAdmin at end, export, giữ nguyên cũ)
const pool = require("../config/index");
const { ErrorHandler } = require("../helpers/error");

const createOrderDb = async ({ userId, amount, itemTotal, ref, paymentMethod, addressData }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update user info with addressData (no addresses table)
    let shippingAddressId = null;  // No address ID
    if (addressData) {
      const { fullname: full_name, address: line1, city, state, country, email, phone } = addressData;  // ✅ THÊM phone in destructuring
      // Update users with new info (fullname, address, city, state, country, phone)
      await client.query(
        `UPDATE users SET 
           fullname = $1, address = $2, city = $3, state = $4, country = $5, phone = $6 
         WHERE user_id = $7`,
        [full_name || email, line1, city, state, country || 'VN', phone || null, userId]  // ✅ THÊM phone in params
      );
      console.log(`Updated user info (including phone) for user ${userId}`);  // Debug
    } else {
      // Fallback: No update
      console.log(`No addressData, no update for user ${userId}`);  // Debug
    }

    // 2. Tạo order pending (no shipping_address_id)
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (user_id, amount, total, ref, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [userId, amount, itemTotal, ref, 'qr']
    );

    const orderId = order.id;
    console.log(`Created order ID: ${orderId} with ref: ${ref}`);  // Debug

    // 3. Insert order_items từ cart (join products)
    const { rows: orderItems } = await client.query(
      `INSERT INTO order_items (order_id, product_id, item_name, quantity, unit_price, discount, line_total)
       SELECT $1, c.product_id, p.name, c.quantity, p.price, 0, (c.quantity * p.price)
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $2
       RETURNING *`,
      [orderId, userId]
    );
    console.log(`Inserted ${orderItems.length} order items`);  // Debug

    // 4. Insert payments pending
    await client.query(
      `INSERT INTO payments (order_id, status, provider, amount, provider_ref)
       VALUES ($1, 'pending', $2, $3, $4)`,
      [orderId, 'qr', itemTotal, ref]
    );
    console.log(`Created pending payment for order ${orderId}`);  // Debug

    await client.query('COMMIT');
    return { order, items: orderItems };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DB Error in createOrderDb:', error);  // Log chi tiết lỗi
    throw new ErrorHandler(500, error.message || 'Failed to create order');
  } finally {
    client.release();
  }
};
const updateOrderStatusDb = async ({ ref, status, userId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ✅ Thêm validation: Chỉ cho phép 'delivered' nếu current status = 'delivery'
    if (status === 'delivered') {
      const { rows: [currentOrder] } = await client.query(
        'SELECT status FROM orders WHERE ref = $1 AND user_id = $2',
        [ref, userId]
      );
      if (!currentOrder || currentOrder.status !== 'delivery') {
        throw new ErrorHandler(403, 'Can only confirm receipt for orders in delivery status');
      }
    }

    // Update orders
    const { rowCount: orderUpdateCount } = await client.query(
      `UPDATE orders SET status = $1 WHERE ref = $2 AND user_id = $3`,
      [status, ref, userId]
    );

    if (orderUpdateCount === 0) {
      throw new ErrorHandler(404, 'Order not found');
    }

    // Update payments (join orders để lấy order_id)
    const { rowCount: paymentUpdateCount } = await client.query(
      `UPDATE payments p
       SET status = $1, captured_at = CURRENT_TIMESTAMP
       FROM orders o
       WHERE p.order_id = o.id AND o.ref = $2 AND o.user_id = $3 AND p.status = 'pending'`,
      [status, ref, userId]
    );

    // Empty cart nếu paid
    if (status === 'paid') {
      const { rowCount } = await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
      console.log(`Emptied cart: ${rowCount} items deleted for user ${userId}`);
    }

    await client.query('COMMIT');
    return { success: true, updatedOrders: orderUpdateCount, updatedPayments: paymentUpdateCount };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DB Error in updateOrderStatusDb:', error);
    throw new ErrorHandler(500, error.message || 'Failed to update order status');
  } finally {
    client.release();
  }
};

// Giữ nguyên 100%: User's own orders (thêm ref vào SELECT)
const getAllOrdersDb = async ({ userId, limit, offset }) => {
  try {
    const { rows: countResult } = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(countResult[0].count);

    const { rows: orders } = await pool.query(
      `SELECT id as order_id, ref, user_id, status, created_at::date as date, amount, total 
       FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return { items: orders, total };
  } catch (error) {
    console.error('DB Error in getAllOrdersDb:', error);
    throw new ErrorHandler(500, error.message);
  }
};

// New: Separate admin all orders (join user_name/email)
const getAllOrdersDbAdmin = async ({ limit, offset }) => {
  try {
    const { rows: countResult } = await pool.query("SELECT COUNT(*) FROM orders");
    const total = parseInt(countResult[0].count);

    const { rows: orders } = await pool.query(
      `SELECT o.*, u.fullname AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       ORDER BY o.id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    console.log(`Admin fetched ${orders.length} orders (total: ${total})`);
    return { items: orders, total };
  } catch (error) {
    console.error('DB Error in getAllOrdersDbAdmin:', error);
    throw new ErrorHandler(500, error.message);
  }
};

// ✅ New: Get orders for seller's store (đã có o.*, bao gồm ref)
const getAllOrdersDbSeller = async ({ storeId, limit, offset }) => {
  try {
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) 
      FROM orders o 
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.store_id = $1
    `;
    const { rows: countResult } = await pool.query(countQuery, [storeId]);
    const total = parseInt(countResult[0].count);

    const query = `
      SELECT o.*, u.fullname AS user_name, u.email AS user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.user_id 
      WHERE EXISTS (
        SELECT 1 FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = o.id AND p.store_id = $1
      ) 
      ORDER BY o.created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const { rows: orders } = await pool.query(query, [storeId, limit, offset]);
    console.log(`Seller fetched ${orders.length} orders (total: ${total}) for store ${storeId}`);
    return { items: orders, total };
  } catch (error) {
    console.error('DB Error in getAllOrdersDbSeller:', error);
    throw new ErrorHandler(500, error.message);
  }
};

const getOrderDb = async ({ id, userId }) => {
  const client = await pool.connect();
  try {
    // Query order info
    const { rows: [order] } = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!order) {
      throw new ErrorHandler(404, 'Order not found');
    }

    // Query order_items with product details
    const { rows: orderItems } = await client.query(
      `SELECT 
        oi.id, oi.product_id, oi.item_name, oi.quantity, oi.unit_price, oi.discount, oi.line_total,
        p.name, p.description, p.image_url, p.price as product_price
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    // Combine order with items array
    const fullOrder = {
      ...order,
      items: orderItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        item_name: item.item_name,
        name: item.name || item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price: item.unit_price || item.product_price,
        description: item.description,
        image_url: item.image_url,
        line_total: item.line_total,
        discount: item.discount
      }))
    };

    console.log(`Fetched order ${id}: items count ${fullOrder.items.length}`);
    return fullOrder;
  } catch (error) {
    console.error('DB Error in getOrderDb:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ✅ New: Update status for seller (check via owner_id)
const updateOrderStatusDbSeller = async ({ ref, status, ownerId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update orders
    const { rows: [updatedOrder] } = await client.query(
      `UPDATE orders o SET status = $1 
       WHERE ref = $2 
       AND EXISTS (
         SELECT 1 FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         JOIN stores s ON p.store_id = s.id 
         WHERE oi.order_id = o.id AND s.owner_id = $3
       ) RETURNING *`,
      [status, ref, ownerId]
    );

    if (!updatedOrder) {
      throw new ErrorHandler(404, 'Order not found or not authorized');
    }

    // Update payments (join orders để lấy order_id)
    const { rowCount: paymentUpdateCount } = await client.query(
      `UPDATE payments p
       SET status = $1, captured_at = CURRENT_TIMESTAMP
       FROM orders o
       WHERE p.order_id = o.id AND o.ref = $2 AND p.status = 'pending'`,
      [status, ref]
    );

    // Empty cart nếu paid (nhưng cho seller không cần, vì cart là của user)

    await client.query('COMMIT');
    return { success: true, updatedOrders: 1, updatedPayments: paymentUpdateCount };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DB Error in updateOrderStatusDbSeller:', error);
    throw new ErrorHandler(500, error.message || 'Failed to update order status');
  } finally {
    client.release();
  }
};

const getOrderDbBySeller = async ({ orderId, storeId }) => {
  const client = await pool.connect();
  try {
    // Query order info + user info from users (no addresses), check ownership via order_items/products
    const { rows: [order] } = await client.query(
      `SELECT o.*, 
       u.fullname as user_name, u.email as user_email, u.phone, 
       u.address, u.city, u.state, u.country,
       COALESCE(SUM(oi.line_total), 0) as item_total
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id  -- ✅ JOIN users for address info
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 
       AND EXISTS (
         SELECT 1 FROM order_items oi2 
         JOIN products p2 ON oi2.product_id = p2.id 
         WHERE oi2.order_id = o.id AND p2.store_id = $2
       )
       GROUP BY o.id, u.fullname, u.email, u.phone, u.address, u.city, u.state, u.country`,
      [orderId, storeId]
    );
    if (!order) {
      throw new ErrorHandler(404, 'Order not found or not yours');
    }

    // Query order_items with product details (same as getOrderDb)
    const { rows: orderItems } = await client.query(
      `SELECT 
        oi.id, oi.product_id, oi.item_name, oi.quantity, oi.unit_price, oi.discount, oi.line_total,
        p.name, p.description, p.image_url, p.price as product_price
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Combine order with items array + userData
    const fullOrder = {
      ...order,
      items: orderItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        item_name: item.item_name,
        name: item.name || item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price: item.unit_price || item.product_price,
        description: item.description,
        image_url: item.image_url,
        line_total: item.line_total,
        discount: item.discount
      }))
    };

    // Set userData for frontend (from u JOIN)
    fullOrder.userData = {
      full_name: order.user_name,
      email: order.user_email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      country: order.country,
    };

    console.log(`Fetched seller order ${orderId}: items count ${fullOrder.items.length}, userData: ${JSON.stringify(fullOrder.userData)}`);
    return fullOrder;
  } catch (error) {
    console.error('DB Error in getOrderDbBySeller:', error);
    throw error;
  } finally {
    client.release();
  }
};


const getTotalOrdersDb = async () => {
  const { rows: [result] } = await pool.query("SELECT COUNT(*) FROM orders");
  return parseInt(result.count);
};

const getRevenueStatsDb = async ({ fromDate, toDate, storeId } = {}) => {
  let query = `
    SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month, SUM(o.total) AS revenue
    FROM orders o
    WHERE o.status = 'delivered'
  `;
  const params = [];
  let paramIndex = 1;

  // Filter time (full month range)
  if (fromDate) {
    query += ` AND o.created_at >= $${paramIndex}`;
    params.push(`${fromDate} 00:00:00`);  // First day start
    paramIndex++;
  }
  if (toDate) {
    query += ` AND o.created_at <= $${paramIndex}`;
    params.push(`${toDate} 23:59:59`);  // Last day end
    paramIndex++;
  }

  // Filter store
  if (storeId) {
    query += ` AND EXISTS (
      SELECT 1 FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = o.id AND p.store_id = $${paramIndex}
    )`;
    params.push(storeId);
    paramIndex++;
  }

  query += ` GROUP BY month ORDER BY month DESC LIMIT 12`;

  console.log('🔍 Backend query:', query.replace(/\s+/g, ' '));  // Clean
  console.log('🔍 Backend params:', params);  // Debug
  const { rows } = await pool.query(query, params);
  console.log('🔍 Backend revenue rows:', rows.length, 'data:', rows.map(r => ({month: r.month, revenue: r.revenue})));  // Debug
  return rows;
};

const getTotalDeliveredOrdersForStoreDb = async ({ storeId }) => {
  const query = `
    SELECT COUNT(DISTINCT o.id)
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE p.store_id = $1 AND o.status = 'delivered'
  `;
  const { rows: [result] } = await pool.query(query, [storeId]);
  return parseInt(result.count);
};

const getStoreRevenueStatsDb = async ({ storeId }) => {
  const query = `
    SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month, SUM(oi.line_total) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE p.store_id = $1 AND o.status = 'delivered'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;
  const { rows } = await pool.query(query, [storeId]);
  return rows;
};

module.exports = {
  createOrderDb,
  getAllOrdersDb,
  getAllOrdersDbAdmin,  // New
  getOrderDb,
  updateOrderStatusDb,
  getAllOrdersDbSeller,  // ✅ Add
  updateOrderStatusDbSeller,  // ✅ Add
  getOrderDbBySeller,
  getTotalOrdersDb,
  getRevenueStatsDb,
  getTotalDeliveredOrdersForStoreDb,
  getStoreRevenueStatsDb,
};