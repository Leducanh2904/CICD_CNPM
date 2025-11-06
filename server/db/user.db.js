const pool = require("../config");

const getAllUsersDb = async () => {
  const { rows: users } = await pool.query("select * from users");
  return users;
};

const createUserDb = async ({ username, password, email, fullname, roles = 'user', phone }) => {  // ✅ THÊM phone param
  const { rows: user } = await pool.query(
    `INSERT INTO users(username, password, email, fullname, roles, phone) 
    VALUES($1, $2, $3, $3, $4, $5, $6) 
    RETURNING user_id, username, email, fullname, roles, phone, address, city, state, country, created_at`,
    [username, password, email, fullname, roles, phone || null]  // ✅ THÊM phone
  );
  return user[0];
};

const getUserByIdDb = async (id) => {
  const { rows: user } = await pool.query(
    "SELECT users.*, cart.id as cart_id FROM users LEFT JOIN cart ON cart.user_id = users.user_id WHERE users.user_id = $1",  // ✅ FIX: as cart_id (no dot)
    [id]
  );
  return user[0];
};

const getUserByUsernameDb = async (username) => {
  const { rows: user } = await pool.query(
    "SELECT users.*, cart.id as cart_id FROM users LEFT JOIN cart ON cart.user_id = users.user_id WHERE LOWER(users.username) = LOWER($1)",  // ✅ FIX: as cart_id
    [username]
  );
  return user[0];
};

const getUserByEmailDb = async (email) => {
  const { rows: user } = await pool.query(
    "SELECT users.*, cart.id as cart_id FROM users LEFT JOIN cart ON cart.user_id = users.user_id WHERE LOWER(email) = LOWER($1)",  // ✅ FIX: as cart_id
    [email]
  );
  return user[0];
};

const updateUserDb = async ({
  username,
  email,
  fullname,
  id,
  address,
  city,
  state,
  country,
  phone,  // ✅ THÊM phone param
}) => {
  const { rows: user } = await pool.query(
    `UPDATE users SET username = $1, email = $2, fullname = $3, address = $4, city = $5, state = $6, country = $7, phone = $8 
     WHERE user_id = $9 RETURNING username, email, fullname, user_id, address, city, state, country, phone`,  // ✅ THÊM phone in UPDATE/RETURNING
    [username, email, fullname, address, city, state, country, phone || null, id]  // ✅ THÊM phone value
  );
  return user[0];
};

const deleteUserDb = async (id) => {
  const { rows: user } = await pool.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING *",
    [id]
  );
  return user[0];
};

const createUserGoogleDb = async ({ sub, defaultUsername, email, name, phone }) => {  // ✅ THÊM phone if needed
  const { rows } = await pool.query(
    `INSERT INTO users(google_id, username, email, fullname, phone) 
     VALUES($1, $2, $3, $4, $5) ON CONFLICT (email) 
     DO UPDATE SET google_id = $1, fullname = $4, phone = $5 RETURNING *`,
    [sub, defaultUsername, email, name, phone || null]
  );
  return rows[0];
};

const changeUserPasswordDb = async (hashedPassword, email) => {
  return await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
    hashedPassword,
    email,
  ]);
};

const getUsersByRoleDb = async (role) => {
  const { rows: users } = await pool.query(
    `SELECT users.*, cart.id as cart_id 
     FROM users 
     LEFT JOIN cart ON cart.user_id = users.user_id 
     WHERE LOWER(roles) = LOWER($1) 
     ORDER BY users.created_at DESC`,
    [role]
  );
  users.forEach(user => {
    user.password = undefined;
    user.google_id = undefined;
  });
  return users;
};

const getTotalUsersDb = async () => {
  const { rows: [result] } = await pool.query("SELECT COUNT(*) FROM users");
  return parseInt(result.count);
};

const updateStatusDb = async ({ id, status, lockReason, unlockReason }) => {
  let query;
  let values = [id];
  if (status === 'locked') {
    query = `
      UPDATE users 
      SET account_status = $2, lock_reason = $3, unlock_reason = NULL 
      WHERE user_id = $1 
      RETURNING user_id, username, account_status, lock_reason, unlock_reason
    `;
    values.push('locked', lockReason);
  } else if (status === 'active') {
    query = `
      UPDATE users 
      SET account_status = $2, unlock_reason = $3, lock_reason = NULL 
      WHERE user_id = $1 
      RETURNING user_id, username, account_status, lock_reason, unlock_reason
    `;
    values.push('active', unlockReason);
  } else {
    throw new Error('Invalid status');
  }
  const { rows } = await pool.query(query, values);
  if (rows.length === 0) throw new Error('User not found');
  return rows[0];
};

const getSellersWithoutStoreDb = async () => {
  const { rows: users } = await pool.query(
    `SELECT users.*, cart.id as cart_id 
     FROM users 
     LEFT JOIN cart ON cart.user_id = users.user_id 
     WHERE LOWER(roles) = 'seller' 
     AND NOT EXISTS (SELECT 1 FROM stores WHERE stores.owner_id = users.user_id)
     ORDER BY users.created_at DESC`,
    []
  );
  users.forEach(user => {
    user.password = undefined;
    user.google_id = undefined;
  });
  return users;
};

module.exports = {
  getAllUsersDb,
  getUserByIdDb,
  getUserByEmailDb,
  updateUserDb,
  createUserDb,
  createUserGoogleDb,
  deleteUserDb,
  getUserByUsernameDb,
  changeUserPasswordDb, 
  getUsersByRoleDb, 
  getTotalUsersDb,
  updateStatusDb,
  getSellersWithoutStoreDb,
};