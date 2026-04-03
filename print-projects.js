import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
  });
  
  const [cols] = await connection.query('DESCRIBE projects');
  process.stdout.write(JSON.stringify(cols, null, 2));
  await connection.end();
}

run();
