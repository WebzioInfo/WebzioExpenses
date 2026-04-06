import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
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
    let out = '';
    for (const t of tables) {
      const name = Object.values(t)[0];
      const [cols] = await connection.query(`DESCRIBE ${name}`);
      out += `\nTABLE: ${name}\n`;
      cols.forEach(c => {
        out += `  ${c.Field.padEnd(20)} | ${c.Type}\n`;
      });
    }
    fs.writeFileSync('db_schema.txt', out);
    console.log('Schema written to db_schema.txt');
  } catch (error) {
    console.error(error);
  } finally {
    await connection.end();
  }
}
check();
