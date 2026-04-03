import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
  });
  
  const tables = ['people', 'projects', 'transactions'];
  for (const table of tables) {
    const [cols] = await connection.query(`DESCRIBE ${table}`);
    console.log(`Table ${table} columns:`, cols.map(c => c.Field));
  }
  await connection.end();
}

check();
