import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('--- Task System v2 Migration Started ---');

  try {
    // 1. Update status ENUM and add completedDate
    console.log('Updating tasks table schema...');
    
    // First, convert any existing statuses to the new ones to avoid ENUM errors
    await connection.query("UPDATE tasks SET status = 'Not Started' WHERE status = 'Pending'");
    await connection.query("UPDATE tasks SET status = 'Completed' WHERE status = 'Done'");

    // Alter table to new ENUM and add completedDate
    await connection.query(`
      ALTER TABLE tasks 
      MODIFY COLUMN status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
      ADD COLUMN completedDate DATE AFTER dueDate
    `);

    // 2. Ensure notes is TEXT (already is, but ensuring it can handle JSON)
    console.log('Ensuring notes column is ready for JSON data...');
    // No changes needed if it's already TEXT, but let's make sure it's not null by default
    await connection.query("ALTER TABLE tasks MODIFY COLUMN notes TEXT");

    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist (Skipping schema update).');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    await connection.end();
  }
}

migrate();
