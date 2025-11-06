const pool = require("../config");

const getAllProductsDb = async ({ limit, offset }) => {
  const { rows } = await pool.query(
    `SELECT products.*, 
            TRUNC(AVG(reviews.rating), 1) AS avg_rating, 
            COUNT(reviews.*) AS review_count
     FROM products
     LEFT JOIN reviews ON products.id = reviews.product_id
     GROUP BY products.id
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
};

const createProductDb = async ({ name, slug, price, stock, description, image, store_id }) => {
  const { rows: product } = await pool.query(
    `INSERT INTO products(name, slug, price, stock, description, image_url, store_id) 
     VALUES($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [name, slug, price, stock, description, image, store_id]
  );
  return product[0];
};

const getProductDb = async (id) => {
  const { rows: product } = await pool.query(
    `SELECT products.*, 
            TRUNC(AVG(reviews.rating), 1) AS avg_rating, 
            COUNT(reviews.*) AS review_count
     FROM products
     LEFT JOIN reviews ON products.id = reviews.product_id
     WHERE products.id = $1
     GROUP BY products.id`,
    [id]
  );
  return product[0];
};

const getProductBySlugDb = async (slug) => {
  const { rows: product } = await pool.query(
    `SELECT products.*, 
            TRUNC(AVG(reviews.rating), 1) AS avg_rating, 
            COUNT(reviews.*) AS review_count
     FROM products
     LEFT JOIN reviews ON products.id = reviews.product_id
     WHERE products.slug = $1
     GROUP BY products.id`,
    [slug]
  );
  return product[0];
};

const updateProductDb = async (data) => {
  const { name, slug, price, stock, description, image, store_id, id } = data;
  let query = `UPDATE products SET name=$1, slug=$2, price=$3, stock=$4, description=$5, image_url=$6`;
  let values = [name, slug, price, stock, description, image];
  let paramCount = 7;
  if (store_id !== undefined) {
    query += `, store_id=$${paramCount}`;
    values.push(store_id);
    paramCount++;
  }
  query += ` WHERE id=$${paramCount} RETURNING *`;
  values.push(id);
  const { rows: product } = await pool.query(query, values);
  return product[0];
};

const deleteProductDb = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM products 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );
  return rows[0];
};

const getAllProductsByStoreDb = async ({ store_id, limit, offset }) => {
  const { rows } = await pool.query(
    `SELECT products.*, 
            TRUNC(AVG(reviews.rating), 1) AS avg_rating, 
            COUNT(reviews.*) AS review_count
     FROM products
     LEFT JOIN reviews ON products.id = reviews.product_id
     WHERE products.store_id = $1
     GROUP BY products.id
     ORDER BY products.created_at DESC
     LIMIT $2 OFFSET $3`,
    [store_id, limit, offset]
  );
  return rows;
};

const getProductCountByStoreDb = async (store_id) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM products WHERE store_id = $1`,
    [store_id]
  );
  return parseInt(rows[0].count);
};

module.exports = {
  getAllProductsDb,
  createProductDb,
  getProductDb,
  getProductBySlugDb,
  updateProductDb,
  deleteProductDb,
  getAllProductsByStoreDb,
  getProductCountByStoreDb
};