import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function research() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));

    const [staff] = await pool.query('SELECT id, name, email FROM staff LIMIT 5');
    console.log('Sample Staff:', staff);

    const [users] = await pool.query('SELECT id, name, email FROM users LIMIT 5');
    console.log('Sample Users:', users);

  } catch (error) {
    console.error('Research failed:', error);
  } finally {
    await pool.end();
  }
}

research();
