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

  console.log('--- Database Migration Started ---');

  try {
    // 1. Rename 'people' to 'staff' if it exists and 'staff' does not
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    if (tableNames.includes('people') && !tableNames.includes('staff')) {
      console.log('Renaming people table to staff...');
      await connection.query('RENAME TABLE people TO staff');
    } else {
      console.log('Skipped table rename (either already renamed or people missing).');
    }

    // 2. Add email to 'staff'
    console.log('Adding email column to staff...');
    try {
      await connection.query('ALTER TABLE staff ADD COLUMN email VARCHAR(255) AFTER name');
    } catch (e) {
      console.log('Email column might already exist (Skipping).');
    }

    // 3. Add permissions to 'users'
    console.log('Adding permissions column to users...');
    try {
      await connection.query('ALTER TABLE users ADD COLUMN permissions TEXT AFTER role');
    } catch (e) {
      console.log('Permissions column might already exist (Skipping).');
    }

    // 4. Create tasks table
    console.log('Creating tasks table...');
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
        isActive TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedTo) REFERENCES staff(id) ON DELETE SET NULL,
        FOREIGN KEY (assignedBy) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);

    console.log('--- Migration Completed Successfully ---');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
