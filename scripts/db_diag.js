import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));

    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`\nTable: ${tableName}`);
      console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

check();
