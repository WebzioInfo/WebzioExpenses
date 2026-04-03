import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306
    });
    
    console.log('Project Table Columns:');
    const [cols] = await connection.query('DESCRIBE projects');
    cols.forEach(c => {
      console.log(`${c.Field} - ${c.Type} - ${c.Key}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error connecting to DB:', error.message);
  }
}

check();
