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
    console.log("Checking for 'status' column in 'transactions' table...");
    // Check if column exists
    const [columns] = await pool.query('SHOW COLUMNS FROM transactions LIKE "status"');
    
    if (columns.length === 0) {
      console.log("Adding 'status' column to 'transactions' table...");
      await pool.query('ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT "Paid" AFTER date');
      console.log("Status column added successfully.");
    } else {
      console.log("Status column already exists. Skipping.");
    }

  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    pool.end();
  }
}

main();
