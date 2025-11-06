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
    phone VARCHAR(20),
    account_status VARCHAR(20) DEFAULT 'active', 
    lock_reason TEXT, 
    unlock_reason TEXT, 
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



-- =========================
-- Order Items
-- =========================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL
);
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

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id INT REFERENCES addresses(id) ON DELETE SET NULL;

-- Sample Data
-- Users
-- =========================
-- Sample Data (UPDATED)
-- =========================

-- Users
INSERT INTO users (username, fullname, email, password, roles, account_status, lock_reason, unlock_reason) VALUES
('admin', 'Admin User', 'admin@example.com', '$2b$10$4ED.IL8/XN3iTQm9OIxld.M7Vx3kBwNK4/g2ewTXMRuI.TgF4HnG6','admin', 'active', NULL, NULL),
('johndoe', 'John Doe', 'john@example.com',  '$2b$10$4KuyIcV5cBnjwV67QHMbS.k6Vyu3ToLQGp3AglNgyeNM2fxhUcTcW','seller', 'active', NULL, NULL),
('jhindoe', 'Jhin Doe', 'jhin@example.com',  '$2b$10$4KuyIcV5cBnjwV67QHMbS.k6Vyu3ToLQGp3AglNgyeNM2fxhUcTcW','seller', 'active', NULL, NULL), 
('janedoe', 'Jane Doe', 'jane@example.com',  '$2b$10$v2K8gVxZ.jwN9DYzXIZSh.n4ae9fHv82hR5sx3BRH/mePOcPTCny.','user', 'active', NULL, NULL);

-- Stores
INSERT INTO stores (id, owner_id, name, email, phone, description, is_active, created_at, updated_at) VALUES
(1, 2, 'Nhà hàng ABC', 'abc@store.com', '0123456789', 'Nhà hàng chuyên đồ Sài Gòn', false,
 '2025-10-17 02:49:32.863', '2025-10-23 10:43:01.198'),
(2, 3, 'Nhà hàng XYZ', 'xyz@store.com', '0987654321', 'Nhà hàng bán đồ ăn sáng', true,
 '2025-10-17 02:49:32.863', '2025-10-17 02:49:32.863');

-- Store Addresses
INSERT INTO store_addresses (store_id, line1, city, country) VALUES
(1, '123 Đường ABC', 'Hà Nội', 'VN'),
(2, '456 Đường XYZ', 'TP.HCM', 'VN');

-- Products (gán store_id và hình ảnh thật)
INSERT INTO products (name, slug, price, stock, description, image_url, store_id) VALUES
('Bánh mì ốp la', 'banh-mi-op-la', 30000.00, 30, 'Bánh mì ốp la giòn tan, trứng lòng đào, ăn kèm pate và dưa leo.', '/images/banhmi.jpg', 2),
('Cơm tấm sườn bì chả', 'com-tam-suon-bi-cha', 50000.00, 20, 'Cơm tấm truyền thống với sườn nướng thơm lừng, bì, chả trứng hấp.', '/images/comtam.jpg', 2),
('Phở bò tái chín', 'pho-bo-tai-chin', 45000.00, 25, 'Phở bò chuẩn vị Hà Nội, nước lèo trong, thịt bò mềm và thơm.', '/images/pho.jpg', 1),
('Xôi gà xé', 'xoi-ga-xe', 35000.00, 15, 'Xôi dẻo nóng hổi ăn cùng gà xé và hành phi giòn tan.', '/images/xoi.jpg', 1);

-- Reviews
INSERT INTO reviews (product_id, rating, comment) VALUES
(1, 5, 'Bánh mì giòn, trứng ngon, rất đáng tiền!'),
(2, 5, 'Cơm tấm ngon tuyệt, sườn ướp vừa miệng.'),
(3, 4, 'Phở ngon nhưng nước lèo hơi nhạt chút.'),
(4, 5, 'Xôi gà thơm, hành phi giòn rụm!');


-- Addresses for users (for shipping - add if not exists)
INSERT INTO addresses (user_id, full_name, line1, city, country, is_default) 
VALUES (4, 'Jane Doe', '123 User Street, Quận Hoàn Kiếm', 'Hà Nội', 'VN', true);

-- Sample Orders (4 delivered orders, dispersed over Aug-Nov 2025 for chart)
INSERT INTO orders (id, user_id, amount, total, ref, payment_method, status, created_at) VALUES
-- Order 1: Aug 2025 (store 1 focus, total=250k)
(1, 4, 250000.00, 250000.00, 'ORDER-20250815-ABC', 'qr', 'delivered', '2025-08-15 10:00:00'),
-- Order 2: Sep 2025 (store 2 focus, total=180k)
(2, 4, 180000.00, 180000.00, 'ORDER-20250920-XYZ', 'qr', 'delivered', '2025-09-20 14:30:00'),
-- Order 3: Oct 2025 (store 1 focus, total=320k)
(3, 4, 320000.00, 320000.00, 'ORDER-20251010-ABC', 'qr', 'delivered', '2025-10-10 09:15:00'),
-- Order 4: Nov 2025 (existing, fixed total=170k to match items)
(4, 4, 170000.00, 170000.00, 'ORDER-1762173746291', 'qr', 'delivered', '2025-11-03 12:42:26.870794');

-- Order Items for all 4 orders (link to products, sum line_total = total)
INSERT INTO order_items (order_id, product_id, item_name, quantity, unit_price, discount, line_total) VALUES
-- Order 1 (Aug, store 1: Phở (ID3) + Xôi (ID4))
(1, 3, 'Phở bò tái chín', 3, 45000.00, 0.00, 135000.00),
(1, 4, 'Xôi gà xé', 3, 35000.00, 0.00, 105000.00),
(1, 4, 'Xôi gà xé', 1, 10000.00, 0.00, 10000.00),  -- Adjusted price to match total 250k
-- Order 2 (Sep, store 2: Bánh mì (ID1) + Cơm tấm (ID2))
(2, 1, 'Bánh mì ốp la', 3, 30000.00, 0.00, 90000.00),
(2, 2, 'Cơm tấm sườn bì chả', 2, 45000.00, 0.00, 90000.00),  -- Adjusted price to match total 180k
-- Order 3 (Oct, store 1: Phở + Xôi)
(3, 3, 'Phở bò tái chín', 4, 45000.00, 0.00, 180000.00),
(3, 4, 'Xôi gà xé', 4, 35000.00, 0.00, 140000.00),
-- Order 4 (Nov, store 1: Phở + Xôi - fixed to match total 170k)
(4, 3, 'Phở bò tái chín', 3, 45000.00, 0.00, 135000.00),
(4, 4, 'Xôi gà xé', 1, 35000.00, 0.00, 35000.00);

-- Payments for all 4 orders (completed)
INSERT INTO payments (order_id, status, provider, provider_ref, amount) VALUES
(1, 'completed', 'qr', 'ORDER-20250815-ABC', 250000.00),
(2, 'completed', 'qr', 'ORDER-20250920-XYZ', 180000.00),
(3, 'completed', 'qr', 'ORDER-20251010-ABC', 320000.00),
(4, 'completed', 'qr', 'ORDER-1762173746291', 170000.00);

-- Reset Sequences 
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders), true);
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items), true);
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments), true);

-- =========================
-- Reset Sequences 
-- =========================
SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores), true);
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users), true);
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products), true);