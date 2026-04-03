import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'db46096.public.databaseasp.net',
    user: 'db46096',
    password: 'WebzioWeb',
    database: 'db46096',
    port: 3306,
  });

  try {
    console.log("Migrating 'Investment' to 'Revenue'...");
    const [result] = await pool.query('UPDATE transactions SET type = ? WHERE type = ?', ['Revenue', 'Investment']);
    console.log(`Migration successful. Rows affected: ${result.affectedRows}`);
  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    pool.end();
  }
}

main();
