import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    console.log('Connecting to database...');
    // Check if column exists first
    const [columns] = await pool.query('SHOW COLUMNS FROM transactions LIKE "scope"');
    
    if (columns.length === 0) {
      console.log('Adding "scope" column to transactions table...');
      await pool.query('ALTER TABLE transactions ADD COLUMN scope VARCHAR(50) DEFAULT "company" AFTER createdBy');
      console.log('Success: "scope" column added.');
    } else {
      console.log('Note: "scope" column already exists.');
    }

  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

run();
