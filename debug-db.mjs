import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  console.log('Connecting to:', process.env.DB_HOST);
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      connectTimeout: 10000
    });
    console.log('Connected!');
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables:', rows.map(r => Object.values(r)[0]));
    await connection.end();
  } catch (e) {
    console.error('Error connecting to MySQL:', e.message);
    if (e.code === 'ETIMEDOUT') console.log('Connection timed out. Check firewall/remote access.');
  }
}

check();
