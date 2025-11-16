import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment variables");
}

const dbUrl = new URL(process.env.DATABASE_URL);

let pool;

if (!global._pool) {
  global._pool = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace("/", ""),
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    debug: false,
    multipleStatements: false,
  });
}

pool = global._pool;

async function initializeDatabase() {
  if (global._dbInitialized) return;
  global._dbInitialized = true;

  const connection = await pool.getConnection();
  try {
    // USERS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        alternate_email VARCHAR(100),
        phone_number VARCHAR(20),
        alternate_phone VARCHAR(20),
        password VARCHAR(255),
        role ENUM('guest','host','admin') DEFAULT 'guest',
        plan ENUM('free','standard','pro') DEFAULT NULL,
        host_start DATETIME DEFAULT NULL,
        host_end DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // APARTMENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        location_data JSON,
        price_per_night DECIMAL(10,2),
        max_guests INT NOT NULL DEFAULT 1,
        image_url TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // GALLERY
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        display_order INT DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_apartment_id (apartment_id)
      )
    `);

    // Apartment Features
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // Apartment Inclusions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_inclusions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // House Rules
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // Why Book With Us
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_why_book (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // Policies
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        cancellation TEXT,
        booking TEXT,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // OTPS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose ENUM('registration','forgot-password','booking','email-change') NOT NULL,
        expires_at DATETIME NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        attempts INT NOT NULL DEFAULT 0,  -- 👈 added to count failed attempts
        locked BOOLEAN DEFAULT FALSE,     -- 👈 optional: mark locked after 3 failed tries
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email_purpose (email, purpose)
      )
    `);
    

    // VERIFIED DEVICES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verified_devices (
        email VARCHAR(255),
        device_id VARCHAR(255),
        PRIMARY KEY (email, device_id)
      )
    `);

    // BOOKINGS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        apartment_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        guests INT NOT NULL DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        nights INT NOT NULL DEFAULT 1,
        status ENUM('pending','confirmed','cancelled','expired','paid') DEFAULT 'pending',
        guest_details JSON,
        expires_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `);

    // PAYMENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        amount DECIMAL(10,2),
        status ENUM('paid','failed','refunded','cancelled') DEFAULT 'paid',
        method VARCHAR(50),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        razorpay_payment_id VARCHAR(25) DEFAULT NULL,
        refund_id VARCHAR(100) DEFAULT NULL,
        refund_time DATETIME DEFAULT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // REVIEWS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT,
        user_id INT,
        rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // SESSIONS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // USER ACTIVITY
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message VARCHAR(255) NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // PASSWORD RESET
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at DATETIME NOT NULL,
        PRIMARY KEY (email)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        senderName VARCHAR(255),
        subject VARCHAR(255),
        body TEXT,
        readed BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        rating DECIMAL(2, 1) CHECK(rating >= 1 AND rating <= 5) DEFAULT NULL,
        feedback_type ENUM('bug', 'feature', 'suggestion', 'complaint', 'general') DEFAULT 'general',
        status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    connection.release();
  }
}

initializeDatabase();

export default pool;
