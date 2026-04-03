import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });
if (!process.env.DB_HOST) {
  dotenv.config(); // fallback to .env
}

async function run() {
  console.log('🚀 Migrating Categories Table...');
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
    });
    console.log('✅ Connected to MySQL.');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table `categories` created or exists.');

    const incomeDefaults = [
      'Service Fee', 'Product Sale', 'Consultancy', 'Refund', 'Other'
    ];
    
    const expenseDefaults = [
      'Software Subscriptions', 'Office Rent', 'Marketing & Ads', 
      'Hardware', 'Travel', 'Utility Bills', 'Miscellaneous'
    ];

    console.log('Seeding default categories...');
    
    for (const name of incomeDefaults) {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      const [existing] = await conn.query('SELECT name FROM categories WHERE name = ? AND type = ?', [name, 'Money In']);
      if (existing.length === 0) {
        await conn.query('INSERT INTO categories (id, name, type, isActive) VALUES (?, ?, ?, TRUE)', [id, name, 'Money In']);
        console.log(`   + Added Income Category: ${name}`);
      }
    }

    for (const name of expenseDefaults) {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      const [existing] = await conn.query('SELECT name FROM categories WHERE name = ? AND type = ?', [name, 'Money Out']);
      if (existing.length === 0) {
        await conn.query('INSERT INTO categories (id, name, type, isActive) VALUES (?, ?, ?, TRUE)', [id, name, 'Money Out']);
        console.log(`   + Added Expense Category: ${name}`);
      }
    }

    console.log('✅ Migration and seeding successful.');

  } catch (err) {
    console.error('❌ Error during migration:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

run();
