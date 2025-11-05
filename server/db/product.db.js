// db/product.db.js
const db = require('../config');

exports.getAllProductsDb = async ({ limit, offset }) => {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.price, p.stock, p.image_url, p.created_at
     FROM products p
     ORDER BY p.id DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
};

exports.createProductDb = async (data) => {
  const { name, price, stock, image_url } = data;
  const { rows } = await db.query(
    `INSERT INTO products (name, price, stock, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, price, stock, image_url, created_at`,
    [name, price, stock, image_url]
  );
  return rows[0];
};

exports.getProductDb = async (id) => {
  const { rows } = await db.query(
    `SELECT id, name, price, stock, image_url, created_at
     FROM products
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

exports.updateProductDb = async (data) => {
  const { id, name, price, stock, image_url } = data;
  const { rows } = await db.query(
    `UPDATE products
     SET name = $2,
         price = $3,
         stock = $4,
         image_url = $5
     WHERE id = $1
     RETURNING id, name, price, stock, image_url, created_at`,
    [id, name, price, stock, image_url]
  );
  return rows[0];
};

exports.deleteProductDb = async (id) => {
  const { rows } = await db.query(
    `DELETE FROM products
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return rows[0];
};

exports.getProductByNameDb = async (name) => {
  const { rows } = await db.query(
    `SELECT id, name, price, stock, image_url, created_at
     FROM products
     WHERE name ILIKE $1
     ORDER BY id DESC
     LIMIT 1`,
    [name]
  );
  return rows[0];
};

exports.getProductBySlugDb = async (_slug) => {
  // Schema của bạn KHÔNG có cột slug; nếu không dùng, có thể trả null hoặc bỏ hẳn.
  return null;
};
