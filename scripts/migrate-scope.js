import pool from '../src/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    console.log('Adding scope column to transactions...');
    await pool.query("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'company' AFTER projectId;");
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
