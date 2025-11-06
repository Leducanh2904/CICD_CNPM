
const pool = require("../config");

const getAllStoresDb = async ({ limit, offset, search }) => {  // ✅ Add search param
  let query = `
    SELECT stores.*, 
           COALESCE(users.fullname, 'Unknown Owner') AS owner_name
    FROM stores
    LEFT JOIN users ON stores.owner_id = users.user_id
  `;
  const values = [limit, offset];  // ✅ values ban đầu
  if (search) {
    query += ` WHERE LOWER(stores.name) LIKE LOWER($3)`;  // ✅ ILIKE cho search insensitive
    values.push(`%${search}%`);  // ✅ %term% cho partial match
  }
  query += ` ORDER BY stores.created_at DESC LIMIT $1 OFFSET $2`;
  try {
    const result = await pool.query(query, values);
    console.log("Store query result: ", result.rows.length, "rows");
    console.log("Sample store row:", result.rows[0] || "No rows");
    return result.rows;
  } catch (error) {
    console.error("Store DB query error:", error.message);
    throw error;
  }
};

const getStoreByIdDb = async (id) => {
  const query = `
    SELECT stores.*, 
           COALESCE(users.fullname, 'Unknown Owner') AS owner_name,
           sa.line1 AS address_line1,
           sa.line2 AS address_line2,
           sa.city,
           sa.state,
           sa.postal_code,
           sa.country
    FROM stores
    LEFT JOIN users ON stores.owner_id = users.user_id
    LEFT JOIN store_addresses sa ON stores.id = sa.store_id
    WHERE stores.id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    console.log(`Store by ID ${id}:`, result.rows[0] || "No store found");
    return result.rows[0];
  } catch (error) {
    console.error(`Store DB error for ID ${id}:`, error.message);
    throw error;
  }
};

// ✅ New: Get store by owner_id
const getStoreByOwnerDb = async (ownerId) => {
  const query = `
    SELECT stores.*, 
           COALESCE(users.fullname, 'Unknown Owner') AS owner_name
    FROM stores
    LEFT JOIN users ON stores.owner_id = users.user_id
    WHERE stores.owner_id = $1
  `;
  try {
    const result = await pool.query(query, [ownerId]);
    console.log(`Store by owner ${ownerId}:`, result.rows[0] || "No store found");
    return result.rows[0];
  } catch (error) {
    console.error(`Store DB error for owner ${ownerId}:`, error.message);
    throw error;
  }
};

const createStoreDb = async ({ name, description, email, phone, owner_id, is_active }) => {
  const query = `
    INSERT INTO stores (owner_id, name, email, phone, description, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [owner_id, name, email, phone, description, is_active]);
  console.log("Created store:", rows[0]);
  return rows[0];
};

const updateStoreDb = async ({ id, name, description, email, phone, owner_id, is_active }) => {
  const query = `
    UPDATE stores 
    SET owner_id = COALESCE($2, owner_id),
        name = COALESCE($3, name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        description = COALESCE($6, description),
        is_active = COALESCE($7, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, owner_id, name, email, phone, description, is_active]);
  if (!rows[0]) throw new Error("Store not found");
  console.log("Updated store:", rows[0]);
  return rows[0];
};

const deleteStoreDb = async (id) => {
  const query = "DELETE FROM stores WHERE id = $1 RETURNING id";
  const { rows } = await pool.query(query, [id]);
  if (!rows[0]) throw new Error("Store not found");
  console.log("Deleted store ID:", id);
  return rows[0];
};

const getTotalStoresDb = async () => {
  const { rows: [result] } = await pool.query("SELECT COUNT(*) FROM stores");
  return parseInt(result.count);
};

module.exports = {
  getAllStoresDb,
  getStoreByIdDb,
  createStoreDb,
  updateStoreDb,
  deleteStoreDb,
  getStoreByOwnerDb,
  getTotalStoresDb,
};