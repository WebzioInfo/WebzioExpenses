import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envConfig = fs.readFileSync(join(__dirname, '../.env.local'), 'utf8');
const env = dotenv.parse(envConfig);

async function setup() {
  console.log('--- Database Synchronization ---');
  console.log(`Connecting to: ${env.DB_HOST}`);

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  try {
    console.log('✅ Connection Successful!');

    console.log('Creating "people" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS people (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(255)    NOT NULL,
        role         VARCHAR(100)    NOT NULL,
        note         TEXT,
        created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Creating "transactions" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        type         VARCHAR(10)     NOT NULL,
        title        VARCHAR(255)    NOT NULL,
        amount       DECIMAL(12, 2)  NOT NULL,
        category     VARCHAR(100),
        subcategory  VARCHAR(100),
        project_name VARCHAR(255),
        person_id    INT,
        payment_method VARCHAR(100),
        date         DATE            NOT NULL,
        notes        TEXT,
        created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure person_id exists and is linked if table was already created
    try {
      await connection.query('ALTER TABLE transactions ADD COLUMN person_id INT AFTER project_name');
      console.log('✅ Added person_id column to transactions');
    } catch (err) {
      // Ignore if column already exists
    }

    console.log('✅ Database schema synced correctly.');
    console.log('--- Setup Complete ---');
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    await connection.end();
  }
}

setup();
