import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('--- Webzio ERP v3 Migration Started ---');

  try {
    // 1. Create LEADS table
    console.log('Creating leads table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        source VARCHAR(100),
        status ENUM('New', 'Contacted', 'Converted', 'Lost') DEFAULT 'New',
        notes TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create CLIENTS table
    console.log('Creating clients table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        company VARCHAR(255),
        status ENUM('Lead', 'Active', 'Inactive') DEFAULT 'Active',
        notes TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create ACTIVITY_LOG table
    console.log('Creating activity_log table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        module VARCHAR(100),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Update PROJECTS table
    console.log('Updating projects table...');
    try {
      await connection.query('ALTER TABLE projects ADD COLUMN clientId VARCHAR(50) AFTER id');
      await connection.query('ALTER TABLE projects ADD COLUMN status ENUM("Active", "Completed") DEFAULT "Active" AFTER name');
    } catch (e) {
      console.log('Project columns might already exist (Skipping).');
    }

    // 5. Update STAFF table
    console.log('Optimizing staff table...');
    try {
      await connection.query('ALTER TABLE staff MODIFY COLUMN email VARCHAR(255) NOT NULL');
      await connection.query('CREATE UNIQUE INDEX idx_staff_email ON staff(email)');
    } catch (e) {
      console.log('Staff index might already exist (Skipping).');
    }

    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
