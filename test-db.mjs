import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    const tableNames = rows.map(r => Object.values(r)[0]);
    console.log('Tables:', tableNames);
    
    for (const table of tableNames) {
      const [cols] = await pool.query(`DESCRIBE ${table}`);
      console.log(`${table} columns:`, cols.map(c => c.Field).join(', '));
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
