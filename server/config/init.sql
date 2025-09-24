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
    price NUMERIC(12,2) NOT NULL,
    stock INT NOT NULL,
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
    quantity INT DEFAULT 1
);

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
INSERT INTO users (username, fullname, email, password) VALUES
('admin', 'Admin User', 'admin@example.com', '$2b$10$kGRS6oS0u9g4EhaQkX21zOBF3jMC4BGxCgvVd7l0dAx3xpr2L6t6u'),
('johndoe', 'John Doe', 'john@example.com',  '$2b$10$T8u/gyD2bUugGR7whmvN1O3Y0fMLBaOBvDljjZpi8v1D82YrQmoE2'),
('janedoe', 'Jane Doe', 'jane@example.com',  '$2b$10$ZLWXyVv87TjbPbUXWwM2Fe.1GSmSioz4sW6b6QhTnBCSSbwsAhr5W');


-- Products
INSERT INTO products (name, price, stock, image_url) VALUES
  ('shirt', 1500.00, 10, '/images/shirt.jpg'),
  ('hat', 1200.00, 15, '/images/hat.jpg'),
  ('hoodie', 400.00, 25, '/images/hoodie.jpg');

-- Cart
INSERT INTO cart (user_id, product_id, quantity) VALUES
  (2, 1, 1),
  (3, 2, 2);

-- Orders
INSERT INTO orders (user_id, total, status) VALUES
  (1, 2700.00, 'completed');

-- Reviews
INSERT INTO reviews (product_id, rating, comment) VALUES
  (1, 5, 'Excellent laptop, very fast!'),
  (2, 4, 'Great phone but battery could be better'),
  (3, 5, 'Best noise cancelling headphones ever!');
