import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
  });

  try {
    console.log('🚀 Starting ERP/CRM Upgrade Migration...');

    // 1. Create Tasks Table
    console.log('--- Creating tasks table ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assignedTo VARCHAR(50),
        assignedBy VARCHAR(50),
        projectId VARCHAR(50),
        status ENUM('Pending', 'In Progress', 'Done') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        startDate DATE,
        dueDate DATE,
        notes TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Enhance Users Table
    console.log('--- Enhancing users table ---');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS permissions TEXT AFTER role
    `);
    
    // Set default permissions for existing admins if empty
    await connection.query(`
      UPDATE users 
      SET permissions = '["Finance", "Projects", "Tasks", "Staff"]' 
      WHERE role = 'admin' AND (permissions IS NULL OR permissions = '')
    `);

    // 3. Enhance Projects Table
    console.log('--- Enhancing projects table ---');
    await connection.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS client VARCHAR(255) AFTER name,
      ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Completed', 'On Hold') DEFAULT 'Active' AFTER client
    `);

    console.log('✅ ERP/CRM Upgrade Migration Successful!');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
