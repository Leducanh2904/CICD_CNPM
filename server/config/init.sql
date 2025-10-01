-- init.sql - UPDATED: Thêm UNIQUE constraint cho cart để fix ON CONFLICT

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================
-- Users
-- =========================
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL, 
    fullname VARCHAR(150) NOT NULL,     
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    roles VARCHAR(50) DEFAULT 'user',       
    address VARCHAR(255),
    city VARCHAR(100),                      
    state VARCHAR(100),                    
    country VARCHAR(100),                  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Products
-- =========================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    stock INT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Cart
-- =========================
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Optional: Để sort items
);

ALTER TABLE cart ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);

-- =========================
-- Orders
-- =========================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    total NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Reviews
-- =========================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Sample Data
-- =========================

-- Users
INSERT INTO users (username, fullname, email, password, roles) VALUES
('admin', 'Admin User', 'admin@example.com', '$2b$10$4ED.IL8/XN3iTQm9OIxld.M7Vx3kBwNK4/g2ewTXMRuI.TgF4HnG6','admin'),
('johndoe', 'John Doe', 'john@example.com',  '$2b$10$4KuyIcV5cBnjwV67QHMbS.k6Vyu3ToLQGp3AglNgyeNM2fxhUcTcW','user'),
('janedoe', 'Jane Doe', 'jane@example.com',  '$2b$10$v2K8gVxZ.jwN9DYzXIZSh.n4ae9fHv82hR5sx3BRH/mePOcPTCny.','user');

-- Products
INSERT INTO products (name, slug, price, stock, description, image_url) VALUES
  ('Shirt',  'shirt',  1500.00, 10, 'Comfortable cotton shirt', '/images/shirt.jpg'),
  ('Hat',    'hat',    1200.00, 15, 'Stylish summer hat', '/images/hat.jpg'),
  ('Hoodie', 'hoodie',  400.00, 25, 'Warm and cozy hoodie', '/images/hoodie.jpg');

-- Reviews
INSERT INTO reviews (product_id, rating, comment) VALUES
  (1, 5, 'Excellent laptop, very fast!'),
  (2, 4, 'Great phone but battery could be better'),
  (3, 5, 'Best noise cancelling headphones ever!');