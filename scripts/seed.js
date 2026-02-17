// Database seed script — creates tables and inserts dummy data
// Run with: node scripts/seed.js

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
};

const DB_NAME = 'bangbang';

async function seed() {
  // Connect without database first to create it
  const conn = await mysql.createConnection(DB_CONFIG);

  console.log('🍞 Creating database...');
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${DB_NAME}\``);

  // ─── Create Tables ───────────────────────────────────────────
  console.log('📦 Creating tables...');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_th VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_th VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(500),
      category_id INT,
      in_stock BOOLEAN DEFAULT TRUE,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      customer_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      slip_image VARCHAR(500),
      status ENUM('pending', 'paid', 'preparing', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      setting_value TEXT
    )
  `);

  // ─── Seed Data ────────────────────────────────────────────────
  console.log('🌱 Seeding data...');

  // Check if data already exists
  const [existingUsers] = await conn.query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) {
    console.log('⚠️  Data already exists, skipping seed...');
    await conn.end();
    return;
  }

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  await conn.query(`
    INSERT INTO users (name, email, password, phone, role) VALUES
    ('Admin ปังๆ', 'admin@bangbang.com', ?, '0812345678', 'admin'),
    ('สมชาย ใจดี', 'somchai@example.com', ?, '0891234567', 'customer')
  `, [adminPassword, userPassword]);

  // Categories
  await conn.query(`
    INSERT INTO categories (name, name_th, slug) VALUES
    ('Sweet Bread', 'ขนมปังหวาน', 'sweet-bread'),
    ('Savory Bread', 'ขนมปังเค็ม', 'savory-bread'),
    ('Croissant', 'ครัวซองต์', 'croissant'),
    ('Danish', 'เดนิช', 'danish'),
    ('Cake', 'เค้ก', 'cake'),
    ('Specialty', 'เมนูพิเศษ', 'specialty')
  `);

  // Products — using Unsplash images for demo
  await conn.query(`
    INSERT INTO products (name, name_th, description, price, image, category_id, in_stock, featured) VALUES
    ('Shokupan', 'โชกุปัง', 'ขนมปังสไตล์ญี่ปุ่นนุ่มฟู เนื้อเนียนละเอียด อบสดใหม่ทุกวัน', 89.00, 'https://images.unsplash.com/photo-1586444248879-bc604cbd555a?w=600&q=80', 1, TRUE, TRUE),
    ('Anpan', 'อันปัง (ไส้ถั่วแดง)', 'ขนมปังไส้ถั่วแดงญี่ปุ่น หอมนุ่ม ไส้แน่น', 45.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80', 1, TRUE, TRUE),
    ('Melon Pan', 'เมลอนปัง', 'ขนมปังเมลอนกรอบนอกนุ่มใน รสหวานอมเปรี้ยว', 55.00, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80', 1, TRUE, TRUE),
    ('Curry Bread', 'ขนมปังแกงกะหรี่', 'ขนมปังทอดไส้แกงกะหรี่ญี่ปุ่น กรอบร้อนๆ', 50.00, 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=600&q=80', 2, TRUE, TRUE),
    ('Ham & Cheese', 'ขนมปังแฮมชีส', 'ขนมปังไส้แฮมชีสเยิ้มๆ อบจนชีสละลาย', 55.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', 2, TRUE, FALSE),
    ('Butter Croissant', 'ครัวซองต์เนย', 'ครัวซองต์เนยฝรั่งเศส กรอบนอกนุ่มใน เนยหอมฟุ้ง', 65.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&q=80', 3, TRUE, TRUE),
    ('Chocolate Croissant', 'ครัวซองต์ช็อกโกแลต', 'ครัวซองต์สอดไส้ช็อกโกแลตเข้มข้น', 75.00, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&q=80', 3, TRUE, FALSE),
    ('Cream Danish', 'เดนิชครีม', 'เดนิชพายกรอบสอดไส้ครีมคัสตาร์ดนุ่มละมุน', 60.00, 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80', 4, TRUE, FALSE),
    ('Strawberry Cake', 'เค้กสตรอว์เบอร์รี', 'เค้กสปัญจ์นุ่มๆ ท็อปด้วยสตรอว์เบอร์รีสดและวิปครีม', 350.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80', 5, TRUE, TRUE),
    ('Matcha Roll', 'โรลมัทฉะ', 'โรลเค้กมัทฉะไส้ครีมสดแท้ หอมชาเขียว', 280.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', 6, TRUE, FALSE)
  `);

  // Settings
  await conn.query(`
    INSERT INTO settings (setting_key, setting_value) VALUES
    ('shop_name', 'ปังๆ'),
    ('shop_name_en', 'BangBang'),
    ('hero_title', 'อบสดใหม่ ทุกวัน'),
    ('hero_subtitle', 'ขนมปังสไตล์ญี่ปุ่นแท้ๆ จากเตาถึงมือคุณ'),
    ('hero_image', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80'),
    ('qr_image', ''),
    ('bank_name', 'ธนาคารกสิกรไทย'),
    ('bank_account', '123-4-56789-0'),
    ('bank_account_name', 'บจก. ปังๆ เบเกอรี่'),
    ('shop_phone', '02-123-4567'),
    ('shop_address', '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'),
    ('shop_line', '@bangbang')
  `);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Admin Login:');
  console.log('   Email: admin@bangbang.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📋 Customer Login:');
  console.log('   Email: somchai@example.com');
  console.log('   Password: password123');

  await conn.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
