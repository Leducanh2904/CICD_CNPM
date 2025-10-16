-- init.sql - UPDATED: Thêm store_id vào products, gán store_id cho sample data

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS store_addresses CASCADE;
DROP TABLE IF EXISTS store_pads CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS item_images CASCADE;
DROP TABLE IF EXISTS inventories CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS coupon_store CASCADE;
DROP TABLE IF EXISTS coupon_approvals CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS drone_deliveries CASCADE;
DROP TABLE IF EXISTS delivery_events CASCADE;
DROP TABLE IF EXISTS email_notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- =========================
-- Enums (đơn giản hóa thành VARCHAR cho format init)
-- =========================
-- role_type -> VARCHAR(50)
-- order_status -> VARCHAR(50)
-- payment_status -> VARCHAR(50)
-- delivery_status -> VARCHAR(50)
-- coupon_status -> VARCHAR(50)
-- discount_type -> VARCHAR(50)
-- report_scope -> VARCHAR(50)

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
-- Stores (tạo trước products để FK)
-- =========================
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(user_id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Store Addresses
-- =========================
CREATE TABLE IF NOT EXISTS store_addresses (
    store_id INT PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'VN',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Store Pads
-- =========================
CREATE TABLE IF NOT EXISTS store_pads (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Products (thêm store_id)
-- =========================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    stock INT NOT NULL,
    description TEXT,
    image_url TEXT,
    store_id INT REFERENCES stores(id) ON DELETE SET NULL, 
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

ALTER TABLE cart ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);


-- =========================
-- Orders (thêm amount, ref, payment_method)
-- =========================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    total NUMERIC(10,2),
    ref VARCHAR(255),
    payment_method VARCHAR(50),
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
-- Roles
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL
);

-- =========================
-- User Roles
-- =========================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================
-- Addresses
-- =========================
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'VN',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Categories
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- =========================
-- Items
-- =========================
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    is_hot BOOLEAN DEFAULT FALSE,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Inventories
-- =========================
CREATE TABLE IF NOT EXISTS inventories (
    item_id INT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    restock_at TIMESTAMP,
    allow_backorder BOOLEAN DEFAULT FALSE
);

-- =========================
-- Ratings
-- =========================
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id),
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    stars INT CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Coupons
-- =========================
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value >= 0),
    min_order_total NUMERIC(12,2) DEFAULT 0,
    max_discount NUMERIC(12,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Coupon Store
-- =========================
CREATE TABLE IF NOT EXISTS coupon_store (
    coupon_id INT REFERENCES coupons(id) ON DELETE CASCADE,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    PRIMARY KEY (coupon_id, store_id)
);

-- =========================
-- Coupon Approvals
-- =========================
CREATE TABLE IF NOT EXISTS coupon_approvals (
    id SERIAL PRIMARY KEY,
    coupon_id INT REFERENCES coupons(id) ON DELETE CASCADE,
    admin_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< Updated upstream
-- =========================
-- Carts
-- =========================
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    coupon_id INT REFERENCES coupons(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Cart Items
-- =========================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, item_id)
);
=======

>>>>>>> Stashed changes

-- =========================
-- Order Items
-- =========================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
<<<<<<< Updated upstream
    item_id INT REFERENCES items(id),
=======
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
>>>>>>> Stashed changes
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL
);
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
-- =========================
-- Payments
-- =========================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 'CARD',
    provider_ref TEXT,
    amount NUMERIC(12,2) NOT NULL,
    authorized_at TIMESTAMP,
    captured_at TIMESTAMP,
    failed_at TIMESTAMP,
    payload TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Refunds
-- =========================
CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    admin_id INT REFERENCES users(user_id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Drone Deliveries
-- =========================
CREATE TABLE IF NOT EXISTS drone_deliveries (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    drone_id VARCHAR(100),
    pickup_pad_id INT REFERENCES store_pads(id),
    drop_latitude NUMERIC(10,7),
    drop_longitude NUMERIC(10,7),
    eta_pickup TIMESTAMP,
    eta_dropoff TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Delivery Events
-- =========================
CREATE TABLE IF NOT EXISTS delivery_events (
    id SERIAL PRIMARY KEY,
    delivery_id INT REFERENCES drone_deliveries(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Email Notifications
-- =========================
CREATE TABLE IF NOT EXISTS email_notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    template_code VARCHAR(100) NOT NULL,
    payload TEXT,
    sent_at TIMESTAMP
);

-- =========================
-- Audit Logs
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INT REFERENCES users(user_id),
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    diff TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< Updated upstream
=======
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id INT REFERENCES addresses(id) ON DELETE SET NULL;

>>>>>>> Stashed changes
-- Sample Data
-- Users
INSERT INTO users (username, fullname, email, password, roles) VALUES
('admin', 'Admin User', 'admin@example.com', '$2b$10$4ED.IL8/XN3iTQm9OIxld.M7Vx3kBwNK4/g2ewTXMRuI.TgF4HnG6','admin'),
('johndoe', 'John Doe', 'john@example.com',  '$2b$10$4KuyIcV5cBnjwV67QHMbS.k6Vyu3ToLQGp3AglNgyeNM2fxhUcTcW','seller'),
('janedoe', 'Jane Doe', 'jane@example.com',  '$2b$10$v2K8gVxZ.jwN9DYzXIZSh.n4ae9fHv82hR5sx3BRH/mePOcPTCny.','user');

-- Stores (owner_id = 2 = johndoe)
INSERT INTO stores (owner_id, name, email, phone, description, is_active) VALUES
(2, 'Cửa hàng ABC', 'abc@store.com', '0123456789', 'Cửa hàng thời trang cao cấp', true),
(2, 'Cửa hàng XYZ', 'xyz@store.com', '0987654321', 'Cửa hàng đồ điện tử', true);
<<<<<<< Updated upstream

INSERT INTO store_addresses (store_id, line1, city, country) VALUES
(1, '123 Đường ABC', 'Hà Nội', 'VN'),
(2, '456 Đường XYZ', 'TP.HCM', 'VN');

-- Products (gán store_id)
INSERT INTO products (name, slug, price, stock, description, image_url, store_id) VALUES
('Shirt', 'shirt', 1500.00, 10, 'Comfortable cotton shirt', '/images/shirt.jpg', 1),
('Hat', 'hat', 1200.00, 15, 'Stylish summer hat', '/images/hat.jpg', 1),
('Hoodie', 'hoodie', 400.00, 25, 'Warm and cozy hoodie', '/images/hoodie.jpg', 2);
=======
>>>>>>> Stashed changes

INSERT INTO store_addresses (store_id, line1, city, country) VALUES
(1, '123 Đường ABC', 'Hà Nội', 'VN'),
(2, '456 Đường XYZ', 
'TP.HCM', 'VN');

-- Products (gán store_id)
INSERT INTO products (name, slug, price, stock, description, image_url, store_id) VALUES
('Shirt', 'shirt', 1500.00, 10, 'Comfortable cotton shirt', '/images/shirt.jpg', 1),
('Hat', 'hat', 1200.00, 15, 'Stylish summer hat', '/images/hat.jpg', 1),
('Hoodie', 'hoodie', 400.00, 25, 'Warm and cozy hoodie', '/images/hoodie.jpg', 2);
-- Reviews
INSERT INTO reviews (product_id, rating, comment) VALUES
(1, 5, 'Excellent laptop, very fast!'),
(2, 4, 'Great phone but battery could be better'),
(3, 5, 'Best noise cancelling headphones ever!');